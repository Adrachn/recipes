"use client";

import { useState, useEffect } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  formatQuantity,
  parseQuantity,
  convertToBaseUnit,
} from "@/lib/quantityParser";
import Container from "@/components/Container";
import {
  Check,
  Copy,
  Pencil,
  PlusCircle,
  Printer,
  Trash2,
  X,
} from "lucide-react";

const unitOptions = [
  "g",
  "hg",
  "kg",
  "ml",
  "cl",
  "dl",
  "l",
  "tsp",
  "tbsp",
  "pcs",
  "can",
];

type ShoppingList = Record<string, string[]>;

type PantryItem = {
  id: string;
  name: string;
  quantity: string;
};

const ShoppingListComponent = ({
  shoppingList,
  pantryItems,
  excludePantryItems,
  onToggleExclude,
  onClear,
  onRemoveItem,
  onAddItem,
  onEditItem,
  title,
  onSetTitle,
}: {
  shoppingList: ShoppingList | null;
  pantryItems: PantryItem[];
  excludePantryItems: boolean;
  onToggleExclude: () => void;
  onClear: () => void;
  onRemoveItem: (itemName: string) => void;
  onAddItem: (name: string, quantity: string) => void;
  onEditItem: (oldName: string, newName: string, newQuantity: string) => void;
  title: string;
  onSetTitle: (newTitle: string) => void;
}) => {
  const [newItemName, setNewItemName] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const [editingItemName, setEditingItemName] = useState<string | null>(null);
  const [editingItemNewName, setEditingItemNewName] = useState("");
  const [editingItemValue, setEditingItemValue] = useState("");
  const [editingItemUnit, setEditingItemUnit] = useState("pcs");
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);

  useEffect(() => {
    setEditingTitle(title);
  }, [title]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemValue.trim()) return;
    const quantity = `${newItemValue} ${newItemUnit}`;
    onAddItem(newItemName.trim(), quantity);
    setNewItemName("");
    setNewItemValue("");
    setNewItemUnit("pcs");
  };

  const handleEdit = (name: string, quantities: string[]) => {
    setEditingItemName(name);
    setEditingItemNewName(name);
    // For simplicity, we edit based on the first quantity if there are multiple.
    const parsed = parseQuantity(quantities[0]);
    if (parsed) {
      setEditingItemValue(String(parsed.value));
      setEditingItemUnit(parsed.unit);
    } else {
      setEditingItemValue("");
      setEditingItemUnit("pcs");
    }
  };

  const handleCancel = () => {
    setEditingItemName(null);
    setEditingItemNewName("");
    setEditingItemValue("");
    setEditingItemUnit("pcs");
  };

  const handleSave = (oldName: string) => {
    if (!editingItemNewName.trim() || !editingItemValue.trim()) return;
    const newQuantity = `${editingItemValue} ${editingItemUnit}`;
    onEditItem(oldName, editingItemNewName, newQuantity);
    handleCancel();
  };

  const handleTitleSave = () => {
    if (editingTitle.trim()) {
      onSetTitle(editingTitle.trim());
    } else {
      setEditingTitle(title); // Revert if empty
    }
    setIsEditingTitle(false);
  };

  const handleCopy = (list: [string, string][]) => {
    const listText = list
      .map(([name, quantity]) => `${name} (${quantity})`)
      .join("\n");
    navigator.clipboard.writeText(listText).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  if (!shoppingList || Object.keys(shoppingList).length === 0) {
    return (
      <div className="p-4 text-center py-12 bg-slate-50 rounded-lg h-full flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">
          Shopping List is Empty
        </h2>
        <p className="text-slate-500">Generate a list from your meal plan.</p>
      </div>
    );
  }

  // 1. Sum up all required ingredients into base units
  const requiredTotals: Record<
    string,
    { value: number; unit: string; originalName: string }
  > = {};

  for (const [name, quantities] of Object.entries(shoppingList)) {
    for (const qStr of quantities) {
      const parsed = parseQuantity(qStr);
      if (parsed) {
        const base = convertToBaseUnit(parsed);
        if (base) {
          const key = name.toLowerCase();
          if (!requiredTotals[key]) {
            requiredTotals[key] = {
              value: 0,
              unit: base.unit,
              originalName: name,
            };
          }
          // Simple safety check for unit compatibility
          if (requiredTotals[key].unit === base.unit) {
            requiredTotals[key].value += base.value;
          }
        }
      }
    }
  }

  // 2. Create a map of available pantry items in their base units
  const pantryTotals: Record<string, { value: number; unit: string }> = {};
  if (excludePantryItems) {
    for (const item of pantryItems) {
      const parsed = parseQuantity(item.quantity);
      if (parsed) {
        const base = convertToBaseUnit(parsed);
        if (base) {
          pantryTotals[item.name.toLowerCase()] = {
            value: base.value,
            unit: base.unit,
          };
        }
      }
    }
  }

  // 3. Calculate the difference
  const finalShoppingList: Record<string, string> = {};
  for (const [key, required] of Object.entries(requiredTotals)) {
    const available = pantryTotals[key];
    let neededValue = required.value;

    if (available && available.unit === required.unit) {
      neededValue -= available.value;
    }

    if (neededValue > 0) {
      finalShoppingList[required.originalName] = formatQuantity(
        neededValue,
        required.unit
      );
    }
  }

  const sortedList = Object.entries(finalShoppingList).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  if (sortedList.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Shopping List
        </h2>
        <p className="text-slate-500 text-center pt-8">
          Your pantry has everything you need!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#fdf9e4] border border-amber-300 p-6 rounded-lg shadow-xl h-full printable">
      <div className="flex justify-between items-center mb-4">
        {isEditingTitle ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave();
              if (e.key === "Escape") setIsEditingTitle(false);
            }}
            className="text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-slate-400 focus:outline-none focus:border-slate-800 flex-grow"
            autoFocus
          />
        ) : (
          <h2
            className="text-2xl font-bold text-slate-800 cursor-pointer"
            onClick={() => setIsEditingTitle(true)}
          >
            {title}
          </h2>
        )}
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={() => handleCopy(sortedList)}
            className="btn btn-ghost btn-sm btn-square text-slate-500 hover:text-slate-800"
            title="Copy list"
          >
            {copySuccess ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-ghost btn-sm btn-square text-slate-500 hover:text-slate-800"
            title="Print list"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={onClear}
            className="btn btn-ghost btn-sm btn-square text-slate-500 hover:text-red-500"
            title="Delete list"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 border-b border-t border-slate-200 py-2 no-print">
        <div className="form-control">
          <label className="label cursor-pointer gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={excludePantryItems}
              onChange={onToggleExclude}
            />
            <span className="label-text text-sm ml-2">
              Exclude pantry items
            </span>
          </label>
        </div>
      </div>

      <ul className="space-y-4 my-6">
        {sortedList.map(([name, quantity]) => (
          <li
            key={name}
            className="flex items-center justify-between border-b border-slate-200 py-3"
          >
            {editingItemName === name ? (
              <div className="flex-grow flex items-center gap-2">
                <input
                  type="text"
                  value={editingItemNewName}
                  onChange={(e) => setEditingItemNewName(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Item name"
                />
                <input
                  type="number"
                  value={editingItemValue}
                  onChange={(e) => setEditingItemValue(e.target.value)}
                  className="input input-bordered w-24"
                  placeholder="Qty"
                />
                <select
                  value={editingItemUnit}
                  onChange={(e) => setEditingItemUnit(e.target.value)}
                  className="select select-bordered"
                >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSave(name)}
                  className="btn btn-ghost btn-square"
                  title="Save"
                >
                  <Check className="w-5 h-5 text-green-500" />
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost btn-square"
                  title="Cancel"
                >
                  <X className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-lg text-slate-700 capitalize">
                    {name}
                  </span>
                  <p className="font-mono text-slate-500 text-sm item-quantity">
                    {quantity}
                  </p>
                </div>
                <div className="flex items-center no-print">
                  <button
                    onClick={() => handleEdit(name, [quantity])}
                    className="text-slate-400 hover:text-blue-500 mr-2"
                    title="Edit item"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(name)}
                    className="text-slate-400 hover:text-red-500"
                    title="Remove item"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-200 pt-4 no-print">
        <h3 className="font-semibold text-md mb-2">Add to List</h3>
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name"
            className="input input-bordered w-full input-sm"
          />
          <input
            type="number"
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            placeholder="Qty"
            className="input input-bordered w-20 input-sm"
          />
          <select
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="select select-bordered select-sm"
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!newItemName.trim() || !newItemValue.trim()}
          >
            <PlusCircle size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default function PantryPage() {
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemValue, setNewItemValue] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("pcs");
  const [excludePantryItems, setExcludePantryItems] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemValue, setEditingItemValue] = useState("");
  const [editingItemUnit, setEditingItemUnit] = useState("pcs");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [shoppingListTitle, setShoppingListTitle] = useState("Shopping List");

  useEffect(() => {
    try {
      const savedList = localStorage.getItem("shoppingList");
      if (savedList) {
        setShoppingList(JSON.parse(savedList));
      }
      const savedPantry = localStorage.getItem("pantryItems");
      if (savedPantry) {
        setPantryItems(JSON.parse(savedPantry));
      }
      const savedExcludePref = localStorage.getItem("excludePantryItems");
      if (savedExcludePref) {
        setExcludePantryItems(JSON.parse(savedExcludePref));
      }
      const savedTitle = localStorage.getItem("shoppingListTitle");
      if (savedTitle) {
        setShoppingListTitle(JSON.parse(savedTitle));
      }
    } catch (error) {
      console.error(
        "Failed to parse shopping list or pantry from localStorage",
        error
      );
    }
    setIsLoading(false);
  }, []);

  const handleAddPantryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemValue.trim()) return;

    const newItem: PantryItem = {
      id: new Date().toISOString(),
      name: newItemName.trim(),
      quantity: `${newItemValue} ${newItemUnit}`,
    };
    const updatedPantry = [...pantryItems, newItem];
    setPantryItems(updatedPantry);
    localStorage.setItem("pantryItems", JSON.stringify(updatedPantry));
    setNewItemName("");
    setNewItemValue("");
    setNewItemUnit("pcs");
  };

  const handleDeletePantryItem = (id: string) => {
    const updatedPantry = pantryItems.filter((item) => item.id !== id);
    setPantryItems(updatedPantry);
    localStorage.setItem("pantryItems", JSON.stringify(updatedPantry));
  };

  const handleEditPantryItem = (item: PantryItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    const parsed = parseQuantity(item.quantity);
    if (parsed) {
      setEditingItemValue(String(parsed.value));
      setEditingItemUnit(parsed.unit);
    } else {
      setEditingItemValue("");
      setEditingItemUnit("pcs");
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName("");
    setEditingItemValue("");
    setEditingItemUnit("pcs");
  };

  const handleSaveEdit = (id: string) => {
    if (!editingItemName.trim() || !editingItemValue.trim()) return;

    const updatedPantry = pantryItems.map((item) =>
      item.id === id
        ? {
            ...item,
            name: editingItemName.trim(),
            quantity: `${editingItemValue} ${editingItemUnit}`,
          }
        : item
    );

    setPantryItems(updatedPantry);
    localStorage.setItem("pantryItems", JSON.stringify(updatedPantry));
    handleCancelEdit();
  };

  const handleSetShoppingListTitle = (newTitle: string) => {
    setShoppingListTitle(newTitle);
    localStorage.setItem("shoppingListTitle", JSON.stringify(newTitle));
  };

  const handleToggleExclude = () => {
    const newValue = !excludePantryItems;
    setExcludePantryItems(newValue);
    localStorage.setItem("excludePantryItems", JSON.stringify(newValue));
  };

  const handleClearShoppingList = () => {
    setShoppingList(null);
    localStorage.removeItem("shoppingList");
    setIsClearModalOpen(false);
  };

  const handleAddShoppingListItem = (name: string, quantity: string) => {
    const currentList = shoppingList || {};
    const existingQuantities = currentList[name] || [];
    const newQuantities = quantity
      ? [...existingQuantities, quantity]
      : existingQuantities;

    const newShoppingList = {
      ...currentList,
      [name]: newQuantities,
    };

    setShoppingList(newShoppingList);
    localStorage.setItem("shoppingList", JSON.stringify(newShoppingList));
  };

  const handleRemoveShoppingListItem = (itemName: string) => {
    if (!shoppingList) return;

    const newShoppingList = { ...shoppingList };
    delete newShoppingList[itemName];

    setShoppingList(newShoppingList);
    localStorage.setItem("shoppingList", JSON.stringify(newShoppingList));
  };

  const handleEditShoppingListItem = (
    oldName: string,
    newName: string,
    newQuantity: string
  ) => {
    if (!shoppingList) return;

    const newList = { ...shoppingList };
    const quantities = newQuantity.split(",").map((q) => q.trim());

    // If the name hasn't changed, just update the quantities
    if (oldName === newName) {
      newList[oldName] = quantities;
    } else {
      // If the name has changed, remove the old item and add a new one
      delete newList[oldName];
      newList[newName] = quantities;
    }

    setShoppingList(newList);
    localStorage.setItem("shoppingList", JSON.stringify(newList));
  };

  if (isLoading) {
    return (
      <main>
        <Container>
          <div className="col-span-12 text-center">
            <p className="text-slate-500">Loading your shopping list...</p>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container className="py-8">
        <div className="col-span-12 flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Pantry & Groceries
          </h1>
        </div>

        <ConfirmationModal
          isOpen={isClearModalOpen}
          onClose={() => setIsClearModalOpen(false)}
          onConfirm={handleClearShoppingList}
          title="Clear Shopping List"
        >
          <p>Are you sure you want to delete your entire shopping list?</p>
        </ConfirmationModal>

        <div className="col-span-12 md:col-span-4">
          <ShoppingListComponent
            shoppingList={shoppingList}
            pantryItems={pantryItems}
            excludePantryItems={excludePantryItems}
            onToggleExclude={handleToggleExclude}
            onClear={() => setIsClearModalOpen(true)}
            onRemoveItem={handleRemoveShoppingListItem}
            onAddItem={handleAddShoppingListItem}
            onEditItem={handleEditShoppingListItem}
            title={shoppingListTitle}
            onSetTitle={handleSetShoppingListTitle}
          />
        </div>
        <div className="col-span-12 md:col-span-8">
          <div className="bg-white p-6 rounded-lg shadow-md h-full border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              My Pantry
            </h2>

            <div className="border border-slate-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-2">Add New Item</h3>
              <form
                onSubmit={handleAddPantryItem}
                className="flex flex-col sm:flex-row gap-2"
              >
                <div className="w-full">
                  <label htmlFor="itemName" className="sr-only">
                    Ingredient Name
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ingredient name"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="flex-grow flex gap-2">
                  <label htmlFor="itemValue" className="sr-only">
                    Quantity Value
                  </label>
                  <input
                    id="itemValue"
                    type="number"
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(e.target.value)}
                    placeholder="Qty"
                    className="input input-bordered w-24"
                  />
                  <label htmlFor="itemUnit" className="sr-only">
                    Unit
                  </label>
                  <select
                    id="itemUnit"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="select select-bordered flex-grow"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newItemName.trim() || !newItemValue.trim()}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {pantryItems.length > 0 ? (
                pantryItems
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-md"
                    >
                      {editingItemId === item.id ? (
                        <div className="flex-grow flex items-center gap-2">
                          <input
                            type="text"
                            value={editingItemName}
                            onChange={(e) => setEditingItemName(e.target.value)}
                            className="input input-bordered w-full"
                          />
                          <input
                            type="number"
                            value={editingItemValue}
                            onChange={(e) =>
                              setEditingItemValue(e.target.value)
                            }
                            className="input input-bordered w-24"
                          />
                          <select
                            value={editingItemUnit}
                            onChange={(e) => setEditingItemUnit(e.target.value)}
                            className="select select-bordered"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="btn btn-ghost btn-square"
                            title="Save"
                          >
                            <Check className="w-5 h-5 text-green-500" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-ghost btn-square"
                            title="Cancel"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-semibold capitalize">
                              {item.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleEditPantryItem(item)}
                              className="text-slate-400 hover:text-blue-500 mr-2"
                              title="Edit item"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeletePantryItem(item.id)}
                              className="text-slate-400 hover:text-red-500"
                              title="Delete item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-slate-400 text-center pt-8">
                  Your pantry is empty.
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
