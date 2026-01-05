"""
Clear cache and check product images
"""
from sheets import invalidate_cache, get_products

# Invalidate the cache
invalidate_cache('Master')

# Get fresh products
products = get_products()

print("Product Images (Fresh from Sheets):")
print("=" * 80)
for p in products[:10]:
    print(f"\nProduct: {p.get('name', 'N/A')}")
    print(f"  Image: {p.get('image', 'N/A')}")
    print(f"  Category: {p.get('category', 'N/A')}")
