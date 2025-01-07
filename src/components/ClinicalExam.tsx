import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useStore } from '../store';

interface ClinicalExamProps {
  onReportChange: (report: string) => void;
}

interface CustomInput {
  id: string;
  parentId: string;
  categoryId: string;
  value: string;
  checked: boolean;
  index: number;
}

const ClinicalExam = forwardRef<{ handleReset: () => void }, ClinicalExamProps>(({ onReportChange }, ref) => {
  const { categories, toggleSymptom, report } = useStore();
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [customInputs, setCustomInputs] = useState<CustomInput[]>([]);

  // Générer le rapport complet
  const generateFullReport = useCallback(() => {
    const reportSections = categories.map(category => {
      const standardElements = category.symptoms
        .filter(sym => sym.checked)
        .map((sym, index) => ({
          text: `- ${sym.text}`,
          index
        }));

      const customElements = customInputs
        .filter(input => input.categoryId === category.id && input.checked && input.value.trim())
        .map(input => ({
          text: `- ${input.value.trim()}`,
          index: input.index
        }));

      const allElements = [...standardElements, ...customElements]
        .sort((a, b) => a.index - b.index);

      if (allElements.length === 0) {
        return '';
      }

      return `${category.name}:\n${allElements.map(el => el.text).join('\n')}`;
    }).filter(Boolean);

    return reportSections.join('\n\n');
  }, [categories, customInputs]);

  React.useEffect(() => {
    const fullReport = generateFullReport();
    onReportChange(fullReport);
  }, [report, customInputs, generateFullReport, onReportChange]);

  const handleSymptomToggle = useCallback((categoryId: string, symptomId: string) => {
    toggleSymptom(categoryId, symptomId);
  }, [toggleSymptom]);

  const handleReset = useCallback(() => {
    categories.forEach(category => {
      category.symptoms.forEach(symptom => {
        if (symptom.checked) {
          toggleSymptom(category.id, symptom.id);
        }
      });
    });
    setOpenCategories(new Set());
    setCustomInputs([]);
  }, [categories, toggleSymptom]);

  useImperativeHandle(ref, () => ({
    handleReset
  }));

  const toggleCategory = useCallback((categoryId: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const handleAddCustomInput = useCallback((categoryId: string, parentId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const parentSymptom = category.symptoms.find(sym => sym.id === parentId);
    if (!parentSymptom) return;

    const parentIndex = category.symptoms.indexOf(parentSymptom);

    const newInput: CustomInput = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parentId,
      categoryId,
      value: '',
      checked: true,
      index: parentIndex
    };
    setCustomInputs(prev => [...prev, newInput]);
  }, [categories]);

  const handleRemoveCustomInput = useCallback((inputId: string) => {
    setCustomInputs(prev => prev.filter(input => input.id !== inputId));
  }, []);

  const handleCustomInputChange = useCallback((inputId: string, value: string) => {
    setCustomInputs(prev => prev.map(input => 
      input.id === inputId ? { ...input, value } : input
    ));
  }, []);

  const toggleCustomInput = useCallback((inputId: string) => {
    setCustomInputs(prev => prev.map(input => 
      input.id === inputId ? { ...input, checked: !input.checked } : input
    ));
  }, []);

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <details 
            className="group" 
            open={openCategories.has(category.id)}
            onToggle={(e) => {
              const details = e.currentTarget;
              if (details.open !== openCategories.has(category.id)) {
                toggleCategory(category.id);
              }
            }}
          >
            <summary className="flex items-center justify-between p-3 cursor-pointer bg-gradient-to-r from-primary-100/90 to-accent-100/90 hover:from-primary-200/90 hover:to-accent-200/90 transition-colors">
              <h3 className="text-lg font-semibold text-primary-900">
                {category.name}
              </h3>
              <ChevronDown className="h-5 w-5 text-primary-800 group-open:rotate-180 transition-transform" />
            </summary>

            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="space-y-0.5">
                {category.symptoms.map((symptom) => (
                  <React.Fragment key={symptom.id}>
                    <div className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        id={symptom.id}
                        checked={symptom.checked}
                        onChange={() => handleSymptomToggle(category.id, symptom.id)}
                        className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      <label
                        htmlFor={symptom.id}
                        className="text-sm text-gray-700 flex-1 cursor-pointer"
                      >
                        {symptom.text}
                      </label>
                      <button
                        onClick={() => handleAddCustomInput(category.id, symptom.id)}
                        className="text-primary-600 hover:text-primary-700 p-1 rounded-full hover:bg-primary-50"
                        title="Ajouter un élément personnalisé"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {customInputs
                      .filter(input => input.parentId === symptom.id && input.categoryId === category.id)
                      .map((input) => (
                        <div key={input.id} className="flex items-center gap-2 pl-8 hover:bg-gray-50 p-1 rounded-lg">
                          <input
                            type="checkbox"
                            checked={input.checked}
                            onChange={() => toggleCustomInput(input.id)}
                            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                          <input
                            type="text"
                            value={input.value}
                            onChange={(e) => handleCustomInputChange(input.id, e.target.value)}
                            placeholder="Entrez un élément personnalisé..."
                            className="flex-1 text-sm text-gray-700 border-b border-gray-300 focus:border-primary-500 focus:outline-none bg-transparent"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRemoveCustomInput(input.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                            title="Supprimer cet élément"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </details>
        </div>
      ))}
    </div>
  );
});

ClinicalExam.displayName = 'ClinicalExam';

export default ClinicalExam;