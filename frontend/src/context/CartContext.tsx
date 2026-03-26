// src/context/CartContext.tsx
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type CartItem = {
    eventId: string;
    title: string;
    unitPrice: number;
    quantity: number;
};

type CartContextType = {
    cartItem: CartItem | null;
    setCartItem: (item: CartItem | null) => void;
    clearCart: () => void;
    subtotal: number;
    hasItems: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItem, setCartItem] = useState<CartItem | null>(null);

    const clearCart = useCallback(() => {
        setCartItem(null);
    }, []);

    const value = useMemo(() => {
        const subtotal = cartItem ? cartItem.unitPrice * cartItem.quantity : 0;

        return {
            cartItem,
            setCartItem,
            clearCart,
            subtotal,
            hasItems: Boolean(cartItem && cartItem.quantity > 0),
        };
    }, [cartItem, clearCart]);

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }

    return context;
}
