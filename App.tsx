
import React, { useState, useMemo, useEffect } from 'react';
import { HARM_CATEGORIES } from './constants.ts';
import type { HarmCategory, TestCase } from './types.ts';
import { useGeminiGenerator } from './hooks/useGeminiGenerator.ts';
import { ShieldCheckIcon, SparklesIcon, WarningIcon, ResetIcon, ShareIcon } from './components/icons.tsx';
import CategoryButton from './components/CategoryButton.tsx';
import TestResultCard from './components/TestResultCard.tsx';
import Loader from './components/Loader.tsx';
import ShareModal from './components/ShareModal.tsx';

export default function App() {
  const [selectedCategories, setSelectedCategories] = useState<Set<HarmCategory>>(new Set());
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { generateTests, isLoading, clearResults: clearGeneratorState } = useGeminiGenerator(setTestCases, setError);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      try {
        const base64Data = hash.substring(6);
        const jsonString = decodeURIComponent(escape(atob(base64Data)));
        const sharedTestCases: TestCase[] = JSON.parse(jsonString);

        if (Array.isArray(sharedTestCases) && sharedTestCases.length > 0) {
          setTestCases(sharedTestCases);
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch (e) {
        console.error("Failed to parse shared data from URL", e);
        setError("No se pudieron cargar los datos compartidos. El enlace puede estar dañado.");
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, []);

  const handleCategoryClick = (category: HarmCategory) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleGenerateClick = () => {
    if (selectedCategories.size > 0) {
      generateTests(Array.from(selectedCategories));
    }
  };

  const handleReset = () => {
    setSelectedCategories(new Set());
    clearGeneratorState();
  };

  const sortedTestCases = useMemo(() => {
    return [...testCases].sort((a, b) => a.category.localeCompare(b.category));
  }, [testCases]);

  const shareUrl = useMemo(() => {
    if (testCases.length === 0) return '';
    try {
      const jsonString = JSON.stringify(testCases);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
      const url = new URL(window.location.origin + window.location.pathname);
      url.hash = `data=${base64Data}`;
      return url.toString();
    } catch (e) {
      console.error("Error creating share URL", e);
      return '';
    }
  }, [testCases]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-10">
          <div className="flex justify-center items-center gap-3 mb-2">
            <ShieldCheckIcon className="h-10 w-10 text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Generador de Pruebas de Seguridad
            </h1>
          </div>
          <p className="text-lg text-gray-400">
            Crea casos de prueba para filtrar contenido dañino en plataformas de redes sociales.
          </p>
        </header>

        <section className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">1. Selecciona las categorías de contenido</h2>
          <div className="flex flex-wrap gap-3">
            {HARM_CATEGORIES.map(category => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategories.has(category)}
                onClick={() => handleCategoryClick(category)}
                disabled={isLoading}
              />
            ))}
          </div>
        </section>

        <section className="text-center mb-8">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={handleGenerateClick}
              disabled={selectedCategories.size === 0 || isLoading}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-blue-600 rounded-md shadow-lg transition-all duration-200 ease-in-out hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader />
                  Generando...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Generar Pruebas
                </>
              )}
            </button>
            {(testCases.length > 0 || error) && (
               <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-300 bg-gray-700 rounded-md shadow-lg transition-colors duration-200 ease-in-out hover:bg-gray-600 disabled:opacity-50"
                  aria-label="Reiniciar"
                >
                  <ResetIcon className="h-5 w-5" />
                  Reiniciar
                </button>
            )}
            {testCases.length > 0 && !isLoading && !error && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-700 rounded-md shadow-lg transition-colors duration-200 ease-in-out hover:bg-green-600 disabled:opacity-50"
                aria-label="Compartir resultados"
              >
                <ShareIcon className="h-5 w-5" />
                Compartir
              </button>
            )}
          </div>
        </section>

        <section aria-live="polite">
          {isLoading && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Generando casos de prueba...</h2>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-start gap-3" role="alert">
              <WarningIcon className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Error al generar.</strong>
                <span className="block sm:inline ml-1">{error}</span>
              </div>
            </div>
          )}

          {!isLoading && testCases.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Resultados de Pruebas Generadas</h2>
              <div className="space-y-5">
                {sortedTestCases.map((testCase) => (
                  <TestResultCard key={testCase.id} testCase={testCase} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && testCases.length === 0 && !error && (
             <div className="text-center py-10 px-6 bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg">
                <SparklesIcon className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-white">Listo para generar pruebas</h3>
                <p className="mt-1 text-gray-400">Selecciona una o más categorías y haz clic en "Generar Pruebas" para comenzar.</p>
            </div>
          )}
        </section>
      </main>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
}
