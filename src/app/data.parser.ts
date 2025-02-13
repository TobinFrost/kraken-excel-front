export type ProductRawData = {
  Name: string;
  UpdatedOn: string;
  Prices: string;
  'Rate %': number;
};

export default function ProductParser(raw: ProductRawData) {
  const _product: any = {
    name: '',
    updated_at: '',
    prices: [],
    rate: 0,
    category: 'product',
  };
  if (raw && typeof raw == 'object') {
    if (raw.Name) {
      _product.name = raw.Name;
    }
    if (raw['Rate %']) {
      _product.rate = raw['Rate %'];
    }
    if (raw.Prices && raw.Prices !== 'prices') {
      if (typeof raw.Prices === 'number') {
        raw.Prices = `${raw.Prices}`;
      }
      _product.prices = raw.Prices.split(';').map((item) => {
        const price = parseInt(item);
        return price > 0 ? price : 0;
      });
    }
    if (
      raw.UpdatedOn &&
      /^(\d{4})[-/](\d{2})[-/](\d{2})$/.test(raw.UpdatedOn)
    ) {
      _product.updated_at = new Date(raw.UpdatedOn).toISOString().split('T')[0];
    }
    if (raw.Name) {
      _product.category = _product.name.toLowerCase().includes('equipment')
        ? 'equipment'
        : 'product';
    }
    return _product;
  }
  return null;
}
