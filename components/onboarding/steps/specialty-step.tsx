"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HardHat, Plus, X } from "lucide-react";
import { useState } from "react";

const specialtyOptions = [
  "Builder",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Landscaper",
  "Painter",
  "Roofer",
  "Tiler",
  "Handyman",
  "Other",
];

interface SpecialtyStepProps {
  selectedSpecialties: string[];
  onChange: (specialties: string[]) => void;
}

export function SpecialtyStep({ selectedSpecialties, onChange }: SpecialtyStepProps) {
  const [customSpecialties, setCustomSpecialties] = useState<string[]>([""]);
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    if (specialty === "Other") {
      setShowCustomInputs(checked);
      if (!checked) {
        // Remove all custom specialties when "Other" is unchecked
        const filteredSpecialties = selectedSpecialties.filter(s => !customSpecialties.includes(s));
        onChange(filteredSpecialties.filter(s => s !== "Other"));
        setCustomSpecialties([""]);
      } else {
        onChange([...selectedSpecialties, specialty]);
      }
    } else {
      if (checked) {
        onChange([...selectedSpecialties, specialty]);
      } else {
        onChange(selectedSpecialties.filter(s => s !== specialty));
      }
    }
  };

  const handleCustomSpecialtyChange = (index: number, value: string) => {
    const newCustomSpecialties = [...customSpecialties];
    newCustomSpecialties[index] = value;
    setCustomSpecialties(newCustomSpecialties);

    // Update the main specialties list
    const standardSpecialties = selectedSpecialties.filter(s => specialtyOptions.includes(s));
    const validCustomSpecialties = newCustomSpecialties.filter(s => s.trim() !== "");
    
    onChange([...standardSpecialties, ...validCustomSpecialties]);
  };

  const addCustomSpecialtyField = () => {
    setCustomSpecialties([...customSpecialties, ""]);
  };

  const removeCustomSpecialtyField = (index: number) => {
    const newCustomSpecialties = customSpecialties.filter((_, i) => i !== index);
    setCustomSpecialties(newCustomSpecialties.length === 0 ? [""] : newCustomSpecialties);
    
    // Update the main specialties list
    const standardSpecialties = selectedSpecialties.filter(s => specialtyOptions.includes(s));
    const validCustomSpecialties = newCustomSpecialties.filter(s => s.trim() !== "");
    
    onChange([...standardSpecialties, ...validCustomSpecialties]);
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <HardHat className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Your Specialty</h3>
              <p className="text-sm text-gray-600">
                Tell us about your trade specializations. This helps our AI provide more accurate responses to customers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            What is your business specialty? <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-4">
            Select all trades that apply to your business.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {specialtyOptions.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <Checkbox
                id={`specialty-${specialty}`}
                checked={selectedSpecialties.includes(specialty)}
                onCheckedChange={(checked) => handleSpecialtyToggle(specialty, checked as boolean)}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label 
                htmlFor={`specialty-${specialty}`}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {specialty}
              </Label>
            </div>
          ))}
        </div>

        {/* Custom specialty inputs when "Other" is selected */}
        {showCustomInputs && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Custom Specialties:</Label>
            {customSpecialties.map((customSpecialty, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter custom specialty"
                  value={customSpecialty}
                  onChange={(e) => handleCustomSpecialtyChange(index, e.target.value)}
                  maxLength={40}
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
                {customSpecialties.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomSpecialtyField(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomSpecialtyField}
              className="w-fit"
              disabled={customSpecialties.length >= 3}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Specialty
            </Button>
            {customSpecialties.length >= 3 && (
              <p className="text-xs text-gray-500">Maximum 3 custom specialties allowed</p>
            )}
          </div>
        )}

        {selectedSpecialties.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Selected specialties:</strong> {selectedSpecialties.filter(s => s !== "Other").join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}