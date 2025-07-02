"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, X } from "lucide-react";
import { useState } from "react";

interface ServiceAreaStepProps {
  serviceAreas: string[];
  onChange: (areas: string[]) => void;
}

export function ServiceAreaStep({ serviceAreas, onChange }: ServiceAreaStepProps) {
  const [currentArea, setCurrentArea] = useState("");

  const handleAddArea = () => {
    if (currentArea.trim() && !serviceAreas.includes(currentArea.trim())) {
      onChange([...serviceAreas, currentArea.trim()]);
      setCurrentArea("");
    }
  };

  const handleRemoveArea = (areaToRemove: string) => {
    onChange(serviceAreas.filter(area => area !== areaToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddArea();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Service Area</h3>
              <p className="text-sm text-gray-600">
                Define the areas where you provide your services. This helps customers know if you serve their location.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">
            Where do you provide services? <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-4">
            Add cities, suburbs, or regions where you operate. Be specific to help customers understand your coverage area.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., Sydney CBD, Parramatta, Western Sydney"
            value={currentArea}
            onChange={(e) => setCurrentArea(e.target.value)}
            onKeyPress={handleKeyPress}
            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
          />
          <Button
            type="button"
            onClick={handleAddArea}
            disabled={!currentArea.trim()}
            className="bg-orange-500 hover:bg-orange-600 shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {serviceAreas.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Service Areas:</Label>
            <div className="flex flex-wrap gap-2">
              {serviceAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{area}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveArea(area)}
                    className="hover:text-orange-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {serviceAreas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No service areas added yet. Add your first area above.</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Be specific about your service areas. This helps our AI assistant provide accurate information to customers about whether you service their location.
          </p>
        </div>
      </div>
    </div>
  );
}