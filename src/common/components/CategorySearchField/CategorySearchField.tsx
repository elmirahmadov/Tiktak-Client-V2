import type { RefObject } from "react";

type SearchItem = {
  id: number;
  name: string;
};

type CategorySearchFieldProps = {
  classNames: {
    input: string;
    noResult: string;
    resultItem: string;
    results: string;
  };
  inputRef: RefObject<HTMLInputElement | null>;
  normalizedQuery: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSuggestionClick: (categoryId: number) => void;
  query: string;
  showResults: boolean;
  suggestions: SearchItem[];
};

export default function CategorySearchField({
  classNames,
  inputRef,
  normalizedQuery,
  onBlur,
  onChange,
  onFocus,
  onSubmit,
  onSuggestionClick,
  query,
  showResults,
  suggestions,
}: CategorySearchFieldProps) {
  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          className={classNames.input}
          placeholder="Axtarış"
          aria-label="Axtarış"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={inputRef}
        />
      </form>

      {showResults && normalizedQuery && (
        <div className={classNames.results}>
          {suggestions.length > 0 ? (
            suggestions.map((category) => (
              <button
                key={category.id}
                type="button"
                className={classNames.resultItem}
                onClick={() => onSuggestionClick(category.id)}
              >
                {category.name}
              </button>
            ))
          ) : (
            <div className={classNames.noResult}>Nəticə yoxdur</div>
          )}
        </div>
      )}
    </>
  );
}
