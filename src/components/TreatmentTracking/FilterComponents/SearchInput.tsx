"use client";

import React from "react";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <label
        htmlFor="search-input"
        className="block text-xs sm:text-sm font-medium text-gray-700"
      >
        Buscar por paciente, local ou notas
      </label>
      <input
        id="search-input"
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Digite para buscar..."
        className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
}
