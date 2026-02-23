import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, PackageIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { Select } from './ui/Input';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
interface DeliveryFormProps {
  onSave: (data: {provider: string;tracking?: string;deliveryAddress?: string;phoneNumber?: string;}) => void;
  disabled?: boolean;
  initialData?: {
    provider: string;
    tracking?: string;
    deliveryAddress?: string;
    phoneNumber?: string;
  };
}
export function DeliveryForm({ onSave, initialData, disabled = false }: DeliveryFormProps) {
  const [provider, setProvider] = useState(initialData?.provider || '');
  const [tracking, setTracking] = useState(initialData?.tracking || '');
  const [deliveryAddress, setDeliveryAddress] = useState(initialData?.deliveryAddress || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [providerError, setProviderError] = useState<string | undefined>();
  const [deliveryAddressError, setDeliveryAddressError] = useState<string | undefined>();
  const [phoneNumberError, setPhoneNumberError] = useState<string | undefined>();
  const providerOptions = [
  {
    value: '',
    label: 'Select delivery option'
  },
  {
    value: 'Courier',
    label: 'Courier'
  },
  {
    value: 'Postal',
    label: 'Postal'
  }];
  const isAddressAndPhoneRequired = provider === 'Courier' || provider === 'Postal';
  const validateDeliveryAddress = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed && isAddressAndPhoneRequired) return 'Address is required for this delivery provider';
    return undefined;
  };
  const validatePhoneNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return isAddressAndPhoneRequired ? 'Phone number is required for this delivery provider' : undefined;
    return /^\d{10}$/.test(trimmed) ? undefined : 'Phone number must be exactly 10 digits';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!provider) {
      setProviderError('Please select a delivery option');
      return;
    }
    const trimmedAddress = deliveryAddress.trim();
    const trimmedPhoneNumber = phoneNumber.trim();
    const addressValidationError = validateDeliveryAddress(trimmedAddress);
    if (addressValidationError) {
      setDeliveryAddressError(addressValidationError);
      return;
    }
    const phoneValidationError = validatePhoneNumber(trimmedPhoneNumber);
    if (phoneValidationError) {
      setPhoneNumberError(phoneValidationError);
      return;
    }
    setProviderError(undefined);
    setDeliveryAddressError(undefined);
    setPhoneNumberError(undefined);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSave({
      provider,
      tracking: tracking || undefined,
      deliveryAddress: trimmedAddress || undefined,
      phoneNumber: trimmedPhoneNumber || undefined
    });
    setLoading(false);
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        y: -20
      }}
      transition={{
        duration: 0.3
      }}>

      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Delivery Details
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Delivery Provider"
            options={providerOptions}
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              if (e.target.value) setProviderError(undefined);
              setDeliveryAddressError(validateDeliveryAddress(deliveryAddress));
              setPhoneNumberError(validatePhoneNumber(phoneNumber));
            }}
            error={providerError}
            disabled={disabled}
            required />

          <Input
            label="Delivery Address"
            placeholder="Enter full delivery address"
            value={deliveryAddress}
            onChange={(e) => {
              setDeliveryAddress(e.target.value);
              setDeliveryAddressError(validateDeliveryAddress(e.target.value));
            }}
            error={deliveryAddressError}
            disabled={disabled}
            required={isAddressAndPhoneRequired} />

          <Input
            label="Phone Number"
            placeholder="e.g., 0704949394"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setPhoneNumberError(validatePhoneNumber(e.target.value));
            }}
            error={phoneNumberError}
            disabled={disabled}
            inputMode="numeric"
            maxLength={10}
            pattern="\d{10}"
            required={isAddressAndPhoneRequired} />


          <Input
            label="Tracking Number (Optional)"
            placeholder="e.g., DHL-3923-ABCD"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            disabled={disabled}
            icon={<PackageIcon className="h-5 w-5" />} />


          {tracking &&
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Tracking Number:</p>
              <div className="inline-flex items-center px-3 py-1.5 bg-purple-100 border border-purple-200 rounded-full">
                <PackageIcon className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-700">
                  {tracking}
                </span>
              </div>
            </div>
          }

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={disabled}
            loading={loading}>

            Save Logistics
          </Button>
        </form>
      </Card>
    </motion.div>);

}
