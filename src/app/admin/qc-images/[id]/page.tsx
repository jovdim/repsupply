"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { invalidateProductCache } from "@/lib/supabase/products";
import { ArrowLeft, Plus, X, Upload, Trash2, Folder, Image as ImageIcon, Save, Check, FileUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface QcImage {
  id: number;
  image_url: string;
  sort_order: number;
}

interface QcGroup {
  id: number;
  folder_name: string;
  sort_order: number;
  qc_images: QcImage[];
}

interface Product {
  id: number;
  name: string;
  image: string;
}

export default function ManageQcImagesPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [groups, setGroups] = useState<QcGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload state
  const [uploadingGroupId, setUploadingGroupId] = useState<number | null>(null);
  const [isDragOverGroupId, setIsDragOverGroupId] = useState<number | null>(null);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState(false);
  const [isCreatingGroupUpload, setIsCreatingGroupUpload] = useState(false);
  

  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [id]);

  // Global Paste Handler
  useEffect(() => {
     const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
           if (items[i].type.startsWith("image/")) {
              const file = items[i].getAsFile();
              if (file) files.push(file);
           }
        }

        if (files.length > 0) {
           handleCreateGroupAndUpload(files, `Album ${groups.length + 1}`);
        }
     };

     window.addEventListener("paste", handlePaste);
     return () => window.removeEventListener("paste", handlePaste);
  }, [groups]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global Drag Enter/Leave for overlay
  useEffect(() => {
     const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        // Check if dragging files
        if (e.dataTransfer?.types.includes("Files")) {
           setIsGlobalDragOver(true);
        }
     };

    // We only remove global drag over if we leave the window or drop
     const handleDragLeave = (e: DragEvent) => {
        if (!e.relatedTarget) { // Left the window
           setIsGlobalDragOver(false);
        }
     };

     window.addEventListener("dragenter", handleDragEnter);
     window.addEventListener("dragleave", handleDragLeave);
     // Prevent default dragover to allow drop
     window.addEventListener("dragover", (e) => e.preventDefault());
     window.addEventListener("drop", (e) => {
        e.preventDefault();
        setIsGlobalDragOver(false);
     });

     return () => {
        window.removeEventListener("dragenter", handleDragEnter);
        window.removeEventListener("dragleave", handleDragLeave);
     };
  }, []);

  async function fetchData() {
    setLoading(true);
    
    // Fetch product details
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, name, image")
      .eq("id", id)
      .single();

    if (productError) {
      console.error("Error fetching product:", productError);
      router.push("/admin/qc-images");
      return;
    }
    setProduct(productData);

    const { data: groupsData, error: groupsError } = await supabase
      .from("qc_groups")
      .select(`
        id,
        folder_name,
        sort_order,
        qc_images (
          id,
          image_url,
          sort_order
        )
      `)
      .eq("product_id", id)
      .order("sort_order", { ascending: false });

    if (groupsError) {
      console.error("Error fetching groups:", groupsError);
    } else {
      // Sort images client-side just in case
      const sortedGroups = groupsData?.map(group => ({
        ...group,
        qc_images: group.qc_images.sort((a, b) => a.sort_order - b.sort_order)
      })) || [];
      setGroups(sortedGroups);
    }
    setLoading(false);
  }

  async function handleAddGroup() {
    // Prevent adding new group if the most recent one is empty
    const emptyGroup = groups.find(g => g.qc_images.length === 0);
    if (emptyGroup) {
      alert(`Please upload photos to "${emptyGroup.folder_name}" before creating a new album.`);
      return;
    }

    const nextAlbumName = `Album ${groups.length + 1}`;

    const { error } = await supabase
      .from("qc_groups")
      .insert({
        product_id: parseInt(id),
        folder_name: nextAlbumName,
        sort_order: groups.length,
      });

    if (error) {
      alert("Error adding album: " + error.message);
    } else {
      invalidateProductCache();
      fetchData();
    }
  }
  
  // Creates a new group and uploads files to it immediately
async function handleCreateGroupAndUpload(files: File[] | FileList, groupName: string) {
   if (!files || (files instanceof FileList && files.length === 0) || (Array.isArray(files) && files.length === 0)) return;
   
   // 1. Check if an empty album exists to redirect to
   const emptyGroup = groups.find(g => g.qc_images.length === 0);
   if (emptyGroup) {
      handleUploadImages(files, emptyGroup.id);
      return;
   }

   setIsCreatingGroupUpload(true);
   
   // 2. Create Group
   const { data: groupData, error: groupError } = await supabase
      .from("qc_groups")
      .insert({
         product_id: parseInt(id),
         folder_name: groupName,
         sort_order: groups.length,
      })
      .select()
      .single();
      
   if (groupError || !groupData) {
      alert("Error creating group for upload: " + groupError?.message);
      setIsCreatingGroupUpload(false);
      return;
   }
   
   const newGroupId = groupData.id;
   
   // 3. Upload Images
   // Re-using upload logic but customized for this flow to avoid state race conditions with group list
   const fileArray = files instanceof FileList ? Array.from(files) : files;
   
   const uploads = fileArray.map(async (file, index) => {
      if (!file.type.startsWith("image/")) return null;

      const ext = file.name.split(".").pop() || "png";
      const fileName = `qc-${id}-${newGroupId}-${Date.now()}-${index}.${ext}`;

      const { error: uploadError } = await supabase.storage
         .from("product-images")
         .upload(fileName, file);

      if (uploadError) return null;

      const { data: { publicUrl } } = supabase.storage
         .from("product-images")
         .getPublicUrl(fileName);

      return {
         qc_group_id: newGroupId,
         image_url: publicUrl,
         sort_order: index
      };
   });

   const results = await Promise.all(uploads);
   const validUploads = results.filter(r => r !== null) as any[];

   if (validUploads.length > 0) {
      await supabase.from("qc_images").insert(validUploads);
   }
   
   setIsCreatingGroupUpload(false);
   invalidateProductCache();
   fetchData();
}

  async function handleDeleteGroup(groupId: number) {
    if (!confirm("Are you sure? This will delete all images in this album. Other albums will be re-numbered automatically.")) return;

    // 1. Get all image URLs for this group to delete from storage
    const group = groups.find(g => g.id === groupId);
    const imageUrls = group?.qc_images.map(img => img.image_url) || [];

    // 2. Delete from Storage
    if (imageUrls.length > 0) {
      const fileNames = imageUrls.map(url => url.split("/").pop()).filter(Boolean) as string[];
      if (fileNames.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove(fileNames);
        if (storageError) console.error("Error deleting files from storage:", storageError);
      }
    }

    const { error } = await supabase.from("qc_groups").delete().eq("id", groupId);
    if (error) {
       alert("Error deleting album: " + error.message);
    } else {
       // Re-fetch and re-order names
       const { data: remainingGroups, error: fetchError } = await supabase
          .from("qc_groups")
          .select("id, folder_name, sort_order")
          .eq("product_id", id)
          .order("sort_order", { ascending: true });

       if (!fetchError && remainingGroups) {
          // Update names and sort_orders to be sequential
          const updates = remainingGroups.map((g, index) => ({
             id: g.id,
             product_id: parseInt(id),
             folder_name: `Album ${index + 1}`,
             sort_order: index
          }));

          if (updates.length > 0) {
             const { error: updateError } = await supabase
                .from("qc_groups")
                .upsert(updates);
             if (updateError) console.error("Error re-ordering albums:", updateError);
          }
       }

       invalidateProductCache();
       fetchData();
    }
  }

  async function handleUploadImages(files: FileList | File[] | null, groupId: number) {
    if (!files || (files instanceof FileList && files.length === 0) || (Array.isArray(files) && files.length === 0)) return;
    
    setUploadingGroupId(groupId);
    const group = groups.find(g => g.id === groupId);
    const currentCount = group?.qc_images.length || 0;

    const fileArray = files instanceof FileList ? Array.from(files) : files;

    const uploads = fileArray.map(async (file, index) => {
       if (!file.type.startsWith("image/")) return null;

       const ext = file.name.split(".").pop() || "png";
       const fileName = `qc-${id}-${groupId}-${Date.now()}-${index}.${ext}`;

       const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

       if (uploadError) {
          console.error("Upload failed", uploadError);
          return null;
       }

       const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

       return {
          qc_group_id: groupId,
          image_url: publicUrl,
          sort_order: currentCount + index
       };
    });

    const results = await Promise.all(uploads);
    const validUploads = results.filter(r => r !== null) as any[];

    if (validUploads.length > 0) {
       const { error } = await supabase.from("qc_images").insert(validUploads);
       if (error) alert("Error saving images to DB: " + error.message);
       else {
          invalidateProductCache();
          fetchData();
       }
    }

    setUploadingGroupId(null);
  }

  async function handleDeleteImage(imageId: number, groupId: number, imageUrl: string) {
     // 1. Delete from Storage
     const fileName = imageUrl.split("/").pop();
     if (fileName) {
        const { error: storageError } = await supabase.storage
           .from("product-images")
           .remove([fileName]);
        if (storageError) console.error("Error deleting file from storage:", storageError);
     }

     const { error } = await supabase.from("qc_images").delete().eq("id", imageId);
     if (error) {
        alert("Error deleting image: " + error.message);
     } else {
        setGroups(prev => prev.map(g => {
           if (g.id !== groupId) return g;
           return { ...g, qc_images: g.qc_images.filter(img => img.id !== imageId) };
        }));
        invalidateProductCache();
     }
  }

  // Helper to recursively scan for files in dropped entries
  const scanFilesRecursively = async (items: DataTransferItemList): Promise<File[]> => {
    const files: File[] = [];
    
    const scanEntry = async (entry: any) => {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
          entry.file(resolve, reject);
        });
        if (file.type.startsWith("image/")) {
          files.push(file);
        }
      } else if (entry.isDirectory) {
        const directoryReader = entry.createReader();
        
        const readAllEntries = async () => {
          const entries: any[] = await new Promise((resolve, reject) => {
            directoryReader.readEntries(resolve, reject);
          });
          
          if (entries.length > 0) {
            for (const entry of entries) {
              await scanEntry(entry);
            }
            await readAllEntries();
          }
        };
        
        await readAllEntries();
      }
    };

    const entries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) entries.push(entry);
    }

    for (const entry of entries) {
      await scanEntry(entry);
    }
    
    return files;
  };

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to global
    setIsDragOverGroupId(groupId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverGroupId(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to global
    setIsDragOverGroupId(null);
    
    const files = await scanFilesRecursively(e.dataTransfer.items);
    if (files.length > 0) {
       handleUploadImages(files, groupId);
    }
  }, [groups]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Global Drop (Create new album)
  const handleGlobalDrop = async (e: React.DragEvent) => {
     e.preventDefault();
     setIsGlobalDragOver(false);
     
     const files = await scanFilesRecursively(e.dataTransfer.items);
     if (files.length > 0) {
        await handleCreateGroupAndUpload(files, `Album ${groups.length + 1}`);
     }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-sm text-neutral-400">Loading QC photos...</p>
      </div>
    );
  }

  if (!product) {
     return <div className="text-center p-8 text-neutral-400">Product not found</div>;
  }

  return (
    <div className="min-h-screen pb-20 relative" onDrop={handleGlobalDrop} onDragOver={(e) => e.preventDefault()}>
      
      {/* Global Drag Overlay */}
      {isGlobalDragOver && !isDragOverGroupId && (
         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 pointer-events-none">
            <div className="bg-white/10 border-2 border-dashed border-white/40 rounded-3xl p-12 text-center max-w-lg w-full animate-scale-in">
               <FileUp className="w-16 h-16 text-white mx-auto mb-4" />
               <h3 className="text-2xl font-bold text-white mb-2">Drop files to Create New Album</h3>
               <p className="text-neutral-300">Images will be added to a new album automatically.</p>
            </div>
         </div>
      )}
      
      {/* Non-blocking Uploading Indicator */}
      {(isCreatingGroupUpload || uploadingGroupId) && (
         <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[280px]">
               <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="absolute inset-0 border-2 border-white/10 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileUp className="w-4 h-4 text-white" />
                  </div>
               </div>
               <div>
                  <h3 className="text-sm font-bold text-white">
                    {isCreatingGroupUpload ? "Creating Album..." : "Uploading Photos..."}
                  </h3>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">
                    {isCreatingGroupUpload ? "Preparing images" : "In Progress"}
                  </p>
               </div>
            </div>
         </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pt-6 px-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Link
                  href="/admin/products"
                  className="p-2 -ml-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
               >
                  <ArrowLeft className="w-5 h-5" />
               </Link>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                     <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-white">QC Photos</h1>
                     <p className="text-text-secondary text-sm flex items-center gap-1">
                        Managing albums for 
                        <Link 
                           href={`/admin/products/${id}`} 
                           className="text-white hover:underline underline-offset-4 transition-all inline-flex items-center gap-1 group/link"
                        >
                           {product.name}
                           <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </Link>
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Tip */}
         <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-sm flex items-center justify-between gap-3">
             <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/5 rounded-lg text-neutral-400">
                   <FileUp className="w-4 h-4" />
                </div>
                <p className="text-sm text-neutral-300">
                   <span className="font-bold text-white">Tip:</span> Drag & drop a folder or images anywhere on the page to create a new album instantly. You can also paste images (Ctrl+V).
                 </p>
             </div>
             <div className="flex gap-2">
                <button
                   onClick={() => handleAddGroup()}
                   className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
                >
                   <Plus className="w-4 h-4" />
                   Add Album
                </button>
             </div>
         </div>

         {/* Groups List */}
         <div className="space-y-6">
            {groups.length === 0 ? (
               <div className="text-center py-12 bg-neutral-900/40 border border-white/5 rounded-2xl border-dashed">
                  <Folder className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm font-medium">No QC albums yet.</p>
                  <p className="text-neutral-600 text-xs mt-2">Drag and drop images here to create one automatically.</p>
                  <button 
                     onClick={() => handleAddGroup()}
                     className="mt-4 text-xs text-white underline underline-offset-4 hover:text-neutral-300"
                  >
                     Create Album
                  </button>
               </div>
            ) : (
               groups.map((group) => (
                  <div key={group.id} className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
                     <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                           <Folder className="w-4 h-4 text-neutral-500" />
                           <h3 className="font-bold text-white text-sm">{group.folder_name}</h3>
                           <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
                              {group.qc_images.length} photos
                           </span>
                        </div>
                        <button
                           onClick={() => handleDeleteGroup(group.id)}
                           className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                           title="Delete Group"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     
                     <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                           {/* Upload Button */}
                           <div 
                              onDragOver={(e) => handleDragOver(e, group.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, group.id)}
                              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${
                                 isDragOverGroupId === group.id
                                    ? "border-white/40 bg-white/5 scale-[0.98]"
                                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                              }`}
                           >
                              <label htmlFor={`upload-${group.id}`} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                 {uploadingGroupId === group.id ? (
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2" />
                                 ) : (
                                    <Upload className="w-6 h-6 text-neutral-600 group-hover:text-neutral-400 transition-colors mb-2" />
                                 )}
                                 <span className="text-xs text-neutral-500 font-medium">Add Photos</span>
                              </label>
                              <input
                                 id={`upload-${group.id}`}
                                 type="file"
                                 multiple
                                 accept="image/*"
                                 className="hidden"
                                 onChange={(e) => handleUploadImages(e.target.files, group.id)}
                              />
                           </div>

                           {/* Images */}
                           {group.qc_images.map((img) => (
                              <div key={img.id} className="relative aspect-square rounded-xl bg-neutral-800 border border-white/5 overflow-hidden group">
                                 <Image 
                                    src={img.image_url} 
                                    alt="QC" 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                 />
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a 
                                       href={img.image_url} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                    >
                                       <ImageIcon className="w-4 h-4" />
                                    </a>
                                     <button
                                        onClick={() => handleDeleteImage(img.id, group.id, img.image_url)}
                                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-200 transition-colors"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
}
