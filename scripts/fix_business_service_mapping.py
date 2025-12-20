import os

def fix_business_service():
    path = os.path.join('..', 'src', 'lib', 'businessService.ts')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update photos mapping in fetchBusinesses
    old_photos_mapping = """                photos: biz.business_photos?.map((p: any) => ({
                    id: p.id,
                    url: p.url,
                    isPrimary: p.is_primary,
                    altText: p.alt_text
                })) || [],"""

    new_photos_mapping = """                photos: biz.photos && Array.isArray(biz.photos) && biz.photos.length > 0 
                    ? biz.photos.map((url: string, index: number) => ({
                        id: `photo-${index}`,
                        url: url,
                        isPrimary: index === 0
                    }))
                    : (biz.business_photos?.map((p: any) => ({
                        id: p.id,
                        url: p.url,
                        isPrimary: p.is_primary,
                        altText: p.alt_text
                    })) || []),"""

    if old_photos_mapping in content:
        content = content.replace(old_photos_mapping, new_photos_mapping)
        print("Updated photos mapping for fetchBusinesses")
    else:
        print("Could not find photos mapping in fetchBusinesses (maybe already updated or format slightly different)")

    # 2. Update photos mapping in fetchBusinessById
    old_photos_mapping_by_id = """            photos: data.business_photos?.map((p: any) => ({
                id: p.id,
                url: p.url,
                isPrimary: p.is_primary,
                altText: p.alt_text
            })) || [],"""

    new_photos_mapping_by_id = """            photos: data.photos && Array.isArray(data.photos) && data.photos.length > 0
                ? data.photos.map((url: string, index: number) => ({
                    id: `photo-${index}`,
                    url: url,
                    isPrimary: index === 0
                }))
                : (data.business_photos?.map((p: any) => ({
                    id: p.id,
                    url: p.url,
                    isPrimary: p.is_primary,
                    altText: p.alt_text
                })) || []),"""

    if old_photos_mapping_by_id in content:
        content = content.replace(old_photos_mapping_by_id, new_photos_mapping_by_id)
        print("Updated photos mapping for fetchBusinessById")

    # 3. Update photos mapping in fetchAllBusinesses
    old_photos_mapping_all = """        photos: biz.business_photos?.map((p: any) => ({
            id: p.id,
            url: p.url,
            isPrimary: p.is_primary,
            altText: p.alt_text
        })) || []"""

    new_photos_mapping_all = """        photos: biz.photos && Array.isArray(biz.photos) && biz.photos.length > 0
            ? biz.photos.map((url: string, index: number) => ({
                id: `photo-${index}`,
                url: url,
                isPrimary: index === 0
            }))
            : (biz.business_photos?.map((p: any) => ({
                id: p.id,
                url: p.url,
                isPrimary: p.is_primary,
                altText: p.alt_text
            })) || [])"""

    if old_photos_mapping_all in content:
        content = content.replace(old_photos_mapping_all, new_photos_mapping_all)
        print("Updated photos mapping for fetchAllBusinesses")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_business_service()
