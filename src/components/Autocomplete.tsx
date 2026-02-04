import React from 'react';

interface AutocompleteProps {
  suggestions: string[];
  onSelect: (name: string) => void;
  visible: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ suggestions, onSelect, visible }) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
      {suggestions.map((name, index) => (
        <li
          key={index}
          onClick={() => onSelect(name)}
          className="px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border-b last:border-none border-gray-100 dark:border-slate-700 transition-colors"
        >
          {name}
        </li>
      ))}
    </ul>
  );
};

export default Autocomplete;