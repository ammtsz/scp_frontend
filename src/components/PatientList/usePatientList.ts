import { useState, useEffect, useRef } from "react";
import { PatientBasic } from "@/types/types";
import { usePatients } from "@/hooks/usePatientQueries";

export function usePatientList() {
  const { 
    data: patients = [],
    isLoading: loading,
    error: queryError,
    refetch: refreshPatients
  } = usePatients();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof PatientBasic | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Convert React Query error to string for compatibility
  const error = queryError ? (queryError as Error).message : null;

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSort = (key: keyof PatientBasic) => {
    if (sortBy === key) {
      setSortAsc((asc) => !asc);
    } else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0;
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (aValue === bValue) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortAsc ? aValue - bValue : bValue - aValue;
    }
    return sortAsc
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const paginated = sorted.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(20); // Reset on search
  }, [search]);

  useEffect(() => {
    const handleScroll = () => {
      if (!loaderRef.current) return;
      const rect = loaderRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && visibleCount < sorted.length) {
        setVisibleCount((prev) => Math.min(prev + 20, sorted.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, sorted.length]);

  // Legend maps
  const statusLegend: Record<string, string> = {
    T: "Em Tratamento",
    A: "Alta Médica",
    F: "Faltas Consecutivas",
  };
  const priorityLegend: Record<string, string> = {
    "1": "Exceção",
    "2": "Idoso/crianças",
    "3": "Padrão",
  };

  return {
    patients,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortAsc,
    setSortAsc,
    visibleCount,
    setVisibleCount,
    loaderRef,
    filtered,
    handleSort,
    sorted,
    paginated,
    statusLegend,
    priorityLegend,
    loading,
    error,
    refreshPatients,
  };
}
