import React from 'react';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export interface ReportStyle {
  font: string;
  primaryColor: string;
  secondaryColor: string;
  template: string;
  headerLogo?: string;
}

interface ReportStylesProps {
  style: ReportStyle;
  onStyleChange: (style: ReportStyle) => void;
}

const FONT_OPTIONS = [
  { value: 'helvetica', label: 'Helvetica' },
  { value: 'times', label: 'Times New Roman' },
  { value: 'courier', label: 'Courier' }
];

const TEMPLATE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'modern', label: 'Modern' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'detailed', label: 'Detailed' }
];

export const ReportStyles: React.FC<ReportStylesProps> = ({ style, onStyleChange }) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="font">Font</Label>
            <Select
              value={style.font}
              onValueChange={(value) => onStyleChange({ ...style, font: value })}
            >
              {FONT_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select
              value={style.template}
              onValueChange={(value) => onStyleChange({ ...style, template: value })}
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              type="color"
              id="primaryColor"
              value={style.primaryColor}
              onChange={(e) => onStyleChange({ ...style, primaryColor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <Input
              type="color"
              id="secondaryColor"
              value={style.secondaryColor}
              onChange={(e) => onStyleChange({ ...style, secondaryColor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headerLogo">Header Logo URL (optional)</Label>
            <Input
              type="text"
              id="headerLogo"
              value={style.headerLogo || ''}
              onChange={(e) => onStyleChange({ ...style, headerLogo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
