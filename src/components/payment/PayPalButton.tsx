import React from 'react';

// Mock PayPal components since the actual PayPal package may not be available in this environment
interface PayPalButtonsProps {
  style?: { layout: string };
  createOrder: (data: any, actions: any) => Promise<any>;
  onApprove: (data: any, actions: any) => Promise<void>;
  onError: (err: any) => void;
}

interface PayPalScriptProviderProps {
  options: {
    'client-id': string;
    currency: string;
  };
  children: React.ReactNode;
}

// Mock components for development
const PayPalButtons: React.FC<PayPalButtonsProps> = ({ style, createOrder, onApprove, onError }) => {
  const handleMockPayment = async () => {
    try {
      // Mock successful payment for development
      const mockDetails = {
        id: 'MOCK_PAYMENT_ID',
        status: 'COMPLETED',
        payer: {
          email_address: 'test@example.com'
        }
      };
      await onApprove({}, { order: { capture: () => Promise.resolve(mockDetails) } });
    } catch (error) {
      onError(error);
    }
  };

  return (
    <div className="paypal-buttons-mock">
      <button
        onClick={handleMockPayment}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-6 rounded-lg transition-colors"
      >
        PayPal (Mode Développement)
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Mode développement - Paiement simulé
      </p>
    </div>
  );
};

const PayPalScriptProvider: React.FC<PayPalScriptProviderProps> = ({ children }) => {
  return <div className="paypal-script-provider">{children}</div>;
};

interface PayPalButtonProps {
  amount: string;
  currency: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, currency, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider options={{ 
      "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || 'mock-client-id',
      currency: currency 
    }}>
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={(data, actions) => {
          return Promise.resolve({
            id: 'MOCK_ORDER_ID',
            purchase_units: [
              {
                amount: {
                  value: amount,
                  currency_code: currency
                }
              }
            ]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order.capture();
            onSuccess(details);
          } catch (error) {
            onError(error);
          }
        }}
        onError={(err) => {
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;