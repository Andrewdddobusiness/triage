"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, X, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getPlaceAutocomplete } from "@/app/actions/google-places";

interface ServiceAreaStepProps {
  serviceAreas: string[];
  onChange: (areas: string[]) => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  types: string[];
}

export function ServiceAreaStep({ serviceAreas, onChange }: ServiceAreaStepProps) {
  const [currentArea, setCurrentArea] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      setIsLoading(true);
      setApiError(null);
      try {
        const result = await getPlaceAutocomplete(searchTerm);
        if (result.error) {
          console.error("Places API error:", result.error);
          setApiError(result.error);
          setPredictions([]);
          setShowPredictions(false);
        } else {
          setPredictions(result.predictions);
          setShowPredictions(true);
          setApiError(null);
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setApiError("Network error occurred");
        setPredictions([]);
        setShowPredictions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  useEffect(() => {
    debouncedSearch(currentArea);
  }, [currentArea, debouncedSearch]);

  const handleInputChange = (value: string) => {
    setCurrentArea(value);
  };

  const handleSelectPrediction = (prediction: PlacePrediction) => {
    const areaName = prediction.main_text;
    if (areaName && !serviceAreas.includes(areaName)) {
      onChange([...serviceAreas, areaName]);
    }
    setCurrentArea("");
    setPredictions([]);
    setShowPredictions(false);
  };

  const handleAddManual = () => {
    if (currentArea.trim() && !serviceAreas.includes(currentArea.trim())) {
      onChange([...serviceAreas, currentArea.trim()]);
      setCurrentArea("");
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handleRemoveArea = (areaToRemove: string) => {
    onChange(serviceAreas.filter((area) => area !== areaToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (predictions.length > 0 && showPredictions) {
        handleSelectPrediction(predictions[0]);
      } else {
        handleAddManual();
      }
    } else if (e.key === "Escape") {
      setShowPredictions(false);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding predictions to allow for click events
    setTimeout(() => setShowPredictions(false), 150);
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
            Add cities, suburbs, or regions where you operate. Be specific to help customers understand your coverage
            area.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="e.g., Sydney CBD, Parramatta, Western Sydney"
                value={currentArea}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleInputBlur}
                onFocus={() => {
                  if (predictions.length > 0) setShowPredictions(true);
                }}
                className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 pr-8"
              />
              {isLoading && (
                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            <Button
              type="button"
              onClick={handleAddManual}
              disabled={!currentArea.trim()}
              className="bg-orange-500 hover:bg-orange-600 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Autocomplete dropdown */}
          {showPredictions && predictions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0 focus:bg-orange-50 focus:outline-none"
                  onClick={() => handleSelectPrediction(prediction)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-gray-900 truncate">{prediction.main_text}</div>
                      {prediction.secondary_text && (
                        <div className="text-xs text-gray-500 truncate">{prediction.secondary_text}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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

        {apiError ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Location suggestions are temporarily unavailable. You can still manually enter your
              service areas below.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Start typing to see location suggestions powered by Google Maps. Be specific about
              your service areas to help our AI assistant provide accurate information to customers about whether you
              service their location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
