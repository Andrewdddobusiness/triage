"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { HardHat } from "lucide-react";

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
  const handleSpecialtyToggle = (specialty: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedSpecialties, specialty]);
    } else {
      onChange(selectedSpecialties.filter(s => s !== specialty));
    }
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

        {selectedSpecialties.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Selected specialties:</strong> {selectedSpecialties.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}