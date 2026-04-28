import { useEffect, useMemo, useRef, useState } from "react";

type CategorySearchItem = {
  id: number;
  name: string;
};

type UseCategorySearchOptions<T extends CategorySearchItem> = {
  categories: T[];
  fetchCategories: () => void | Promise<unknown>;
  onSuggestionSelect: (categoryId: number) => void;
};

export function useCategorySearch<T extends CategorySearchItem>({
  categories,
  fetchCategories,
  onSuggestionSelect,
}: UseCategorySearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const hasMountedRef = useRef(false);

  // Initial fetch on component mount
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      const mountFetch = async () => {
        try {
          await fetchCategories();
        } catch (err) {
          console.error("Failed to fetch categories on mount:", err);
        }
      };
      mountFetch();
    }
  }, [fetchCategories]);

  // Debounced fetch when search query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const waitMs = searchQuery.trim() === "" ? 500 : 1200;

    searchTimeoutRef.current = setTimeout(() => {
      const searchFetch = async () => {
        try {
          await fetchCategories();
        } catch (err) {
          console.error("Failed to fetch categories on search:", err);
        }
      };
      searchFetch();
    }, waitMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchCategories]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return categories;
    return categories.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery),
    );
  }, [categories, normalizedQuery]);

  const suggestionList = useMemo(() => {
    if (!normalizedQuery) return [];
    return filteredCategories.slice(0, 6);
  }, [filteredCategories, normalizedQuery]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowResults(false);
    setIsSearchFocused(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleSuggestionClick = (categoryId: number) => {
    setShowResults(false);
    setIsSearchFocused(false);
    onSuggestionSelect(categoryId);
  };

  const handleOverlayClick = () => {
    setShowResults(false);
    setIsSearchFocused(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleFocus = () => {
    setShowResults(true);
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowResults(false);
      setIsSearchFocused(false);
    }, 120);
  };

  return {
    filteredCategories,
    handleBlur,
    handleFocus,
    handleOverlayClick,
    handleSearchSubmit,
    handleSuggestionClick,
    isSearchFocused,
    normalizedQuery,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    showResults,
    suggestionList,
  };
}
