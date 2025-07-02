"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";

const servicesOfferedOptions = [
  "New Builds",
  "Renovations", 
  "Repairs",
  "Installations",
  "Emergency Call-Outs",
  "Inspections",
  "Custom Work",
  "Other",
];

interface ServicesOfferedStepProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
}

export function ServicesOfferedStep({ selectedServices, onChange }: ServicesOfferedStepProps) {
  const handleServiceToggle = (service: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedServices, service]);
    } else {
      onChange(selectedServices.filter(s => s !== service));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Services You Offer</h3>
              <p className="text-sm text-gray-600">
                Select all the services your business provides. This helps our AI assistant handle calls more effectively.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            What services does your business offer? <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-4">
            Select all that apply. You can always update these later.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {servicesOfferedOptions.map((service) => (
            <div key={service} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <Checkbox
                id={`service-${service}`}
                checked={selectedServices.includes(service)}
                onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label 
                htmlFor={`service-${service}`}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {service}
              </Label>
            </div>
          ))}
        </div>

        {selectedServices.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Selected services:</strong> {selectedServices.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}