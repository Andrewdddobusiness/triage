"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Plus, X } from "lucide-react";
import { useState } from "react";

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
  const [customServices, setCustomServices] = useState<string[]>([""]);
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const handleServiceToggle = (service: string, checked: boolean) => {
    if (service === "Other") {
      setShowCustomInputs(checked);
      if (!checked) {
        // Remove all custom services when "Other" is unchecked
        const filteredServices = selectedServices.filter(s => !customServices.includes(s));
        onChange(filteredServices.filter(s => s !== "Other"));
        setCustomServices([""]);
      } else {
        onChange([...selectedServices, service]);
      }
    } else {
      if (checked) {
        onChange([...selectedServices, service]);
      } else {
        onChange(selectedServices.filter(s => s !== service));
      }
    }
  };

  const handleCustomServiceChange = (index: number, value: string) => {
    const newCustomServices = [...customServices];
    newCustomServices[index] = value;
    setCustomServices(newCustomServices);

    // Update the main services list
    const otherServices = selectedServices.filter(s => !servicesOfferedOptions.includes(s));
    const standardServices = selectedServices.filter(s => servicesOfferedOptions.includes(s));
    const validCustomServices = newCustomServices.filter(s => s.trim() !== "");
    
    onChange([...standardServices, ...validCustomServices]);
  };

  const addCustomServiceField = () => {
    setCustomServices([...customServices, ""]);
  };

  const removeCustomServiceField = (index: number) => {
    const newCustomServices = customServices.filter((_, i) => i !== index);
    setCustomServices(newCustomServices.length === 0 ? [""] : newCustomServices);
    
    // Update the main services list
    const otherServices = selectedServices.filter(s => !servicesOfferedOptions.includes(s));
    const standardServices = selectedServices.filter(s => servicesOfferedOptions.includes(s));
    const validCustomServices = newCustomServices.filter(s => s.trim() !== "");
    
    onChange([...standardServices, ...validCustomServices]);
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

        {/* Custom service inputs when "Other" is selected */}
        {showCustomInputs && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Custom Services:</Label>
            {customServices.map((customService, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter custom service"
                  value={customService}
                  onChange={(e) => handleCustomServiceChange(index, e.target.value)}
                  maxLength={50}
                  className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
                {customServices.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCustomServiceField(index)}
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
              onClick={addCustomServiceField}
              className="w-fit"
              disabled={customServices.length >= 5}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>
            {customServices.length >= 5 && (
              <p className="text-xs text-gray-500">Maximum 5 custom services allowed</p>
            )}
          </div>
        )}

        {selectedServices.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Selected services:</strong> {selectedServices.filter(s => s !== "Other").join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}