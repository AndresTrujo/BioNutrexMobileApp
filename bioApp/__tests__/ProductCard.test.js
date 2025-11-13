import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../src/components/ProductCard';
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../src/components/SmartImage', () => 'SmartImage');

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (fn) => fn({ auth: { wishlist: [] } }),
}));

jest.mock('../src/components/ToastProvider', () => ({
  useToast: () => ({ show: jest.fn() }),
}));

const product = {
  id: 'p_test',
  name: 'Producto Test',
  brand: 'Marca',
  price: 9.99,
  rating: 4.4,
  image: 'https://example.com/test.jpg',
};

describe('ProductCard', () => {
  it('renders and Add to Cart button is accessible and pressable', () => {
    const { getByA11yLabel } = render(<ProductCard product={product} onPress={jest.fn()} />);
    const btn = getByA11yLabel(`Agregar ${product.name} al carrito`);
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
  });
});