import React, { useState, useEffect } from 'react';
import { aiApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  Boxes,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PackageCheck,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export const CataloguePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchCat = async () => {
      setLoading(true);
      try {
        const res = await aiApi.getCatalogue();
        if (res.success && Array.isArray(res.data) && isMounted) {
          setItems(res.data);
        }
      } catch (err) {
        console.error('Failed to load catalogue:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCat();
    return () => { isMounted = false; };
  }, []);

  const categories = ['All', ...new Set(items.map(i => i.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.product_name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Verified Humanitarian Inventory
              </span>
              <span className="text-xs text-slate-400 font-mono">PostgreSQL Database</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Standard Supplies Catalogue</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {items.length} items
              </span>
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl">
              All Gemini AI budget calculations and aid matching pull directly from this verified catalogue. No prices or inventories are hallucinated by the model.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center space-x-2 text-xs text-teal-800">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span><strong>100% Deterministic:</strong> Unit prices fixed by regional logistics hubs.</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalogue items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalogue Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading verified inventory from PostgreSQL...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-subtle space-y-2">
            <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No items match your filter</h3>
            <p className="text-xs text-slate-500">Try clearing your search query or selecting All Categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between space-y-4 hover:shadow-card-hover transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                      item.availability_status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.availability_status === 'low_stock'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.availability_status === 'available' && <CheckCircle2 className="w-3 h-3" />}
                      {item.availability_status === 'low_stock' && <AlertTriangle className="w-3 h-3" />}
                      {item.availability_status === 'out_of_stock' && <XCircle className="w-3 h-3" />}
                      <span>
                        {item.availability_status === 'available' ? 'Available' :
                         item.availability_status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.product_name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Fixed Unit Price
                    </span>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      {formatCurrency(item.unit_price)}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">/ {item.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      Stock Level
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-700">
                      {item.available_quantity} {item.unit}s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CataloguePage;

