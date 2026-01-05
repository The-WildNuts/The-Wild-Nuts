"""
Check walnut product specifically
"""
from sheets import invalidate_cache, get_products

# Invalidate cache
invalidate_cache('Master')

# Get products
products = get_products()

# Find walnut products
print("Walnut Products:")
print("=" * 80)
for p in products:
    if 'walnut' in p.get('name', '').lower():
        print(f"\nProduct Name: '{p.get('name')}'")
        print(f"Display Name: '{p.get('displayName')}'")
        print(f"Image: '{p.get('image')}'")
        print(f"Category: '{p.get('category')}'")
