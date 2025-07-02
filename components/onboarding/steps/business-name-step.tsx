"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

interface BusinessNameStepProps {
  value: string;
  onChange: (value: string) => void;
  ownerName: string;
  onOwnerNameChange: (value: string) => void;
}

export function BusinessNameStep({ 
  value, 
  onChange, 
  ownerName, 
  onOwnerNameChange 
}: BusinessNameStepProps) {
  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Business Information</h3>
              <p className="text-sm text-gray-600">
                Help us personalize your experience by providing your business details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="business-name">
            Business Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="business-name"
            type="text"
            placeholder="Enter your business name"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
          />
          <p className="text-sm text-gray-500">
            This will be displayed to your customers when they call.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner-name">
            Owner Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="owner-name"
            type="text"
            placeholder="Enter your full name"
            value={ownerName}
            onChange={(e) => onOwnerNameChange(e.target.value)}
            className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
          />
          <p className="text-sm text-gray-500">
            Your name as the business owner or main contact person.
          </p>
        </div>
      </div>
    </div>
  );
}