"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { invalidateProductCache } from "@/lib/supabase/products";
import { ArrowLeft, Plus, X, Upload, Trash2, Folder, Image as ImageIcon, Save, Check, FileUp } from "lucide-react";
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
  
  // New group state
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

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
           handleCreateGroupAndUpload(files, `Pasted Batch ${new Date().toLocaleTimeString()}`);
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

    // Fetch QC groups and images
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
      .order("sort_order", { ascending: true });

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
    if (!newGroupName.trim()) return;

    const { error } = await supabase
      .from("qc_groups")
      .insert({
        product_id: parseInt(id),
        folder_name: newGroupName,
        sort_order: groups.length,
      });

    if (error) {
      alert("Error adding group: " + error.message);
    } else {
      setNewGroupName("");
      setIsAddingGroup(false);
      invalidateProductCache();
      fetchData();
    }
  }
  
  // Creates a new group and uploads files to it immediately
  async function handleCreateGroupAndUpload(files: File[] | FileList, groupName: string) {
     if (!files || (files instanceof FileList && files.length === 0) || (Array.isArray(files) && files.length === 0)) return;
     
     setIsCreatingGroupUpload(true);
     
     // 1. Create Group
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
     
     // 2. Upload Images
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
    if (!confirm("Are you sure? This will delete all images in this group.")) return;

    const { error } = await supabase.from("qc_groups").delete().eq("id", groupId);
    if (error) {
       alert("Error deleting group: " + error.message);
    } else {
       setGroups(groups.filter(g => g.id !== groupId));
       invalidateProductCache();
    }
  }

  async function handleUploadImages(files: FileList | null, groupId: number) {
    if (!files || files.length === 0) return;
    
    setUploadingGroupId(groupId);
    const group = groups.find(g => g.id === groupId);
    const currentCount = group?.qc_images.length || 0;

    const uploads = Array.from(files).map(async (file, index) => {
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

  async function handleDeleteImage(imageId: number, groupId: number) {
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

  const handleDrop = useCallback((e: React.DragEvent, groupId: number) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling to global
    setIsDragOverGroupId(null);
    handleUploadImages(e.dataTransfer.files, groupId);
  }, [groups]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Global Drop (Create new group)
  const handleGlobalDrop = async (e: React.DragEvent) => {
     e.preventDefault();
     setIsGlobalDragOver(false);
     
     const files = e.dataTransfer.files;
     if (files.length > 0) {
        // Try to guess a name if possible, or use generic
        // e.dataTransfer.items might have webkitGetAsEntry but let's stick to simple first
        await handleCreateGroupAndUpload(files, `Dropped Batch ${new Date().toLocaleTimeString()}`);
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
               <h3 className="text-2xl font-bold text-white mb-2">Drop files to Create New Group</h3>
               <p className="text-neutral-300">Images will be added to a new folder automatically.</p>
            </div>
         </div>
      )}
      
      {/* Uploading Overlay */}
      {isCreatingGroupUpload && (
         <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 text-center shadow-2xl animate-fade-in">
               <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
               <h3 className="text-lg font-bold text-white mb-1">Creating Group & Uploading...</h3>
               <p className="text-neutral-500 text-sm">Please wait while we process your images.</p>
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
                     <p className="text-text-secondary text-sm">Managing photos for {product.name}</p>
                  </div>
               </div>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={() => setIsAddingGroup(true)}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 text-sm"
               >
                  <Plus className="w-4 h-4" />
                  Add Group
               </button>
            </div>
         </div>

         {/* Paste Tip */}
         <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
             <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <FileUp className="w-4 h-4 text-blue-400" />
             </div>
             <p className="text-sm text-blue-200">
                <span className="font-bold text-blue-100">Pro Tip:</span> Drag & drop a folder or images anywhere on the page to create a new group instantly. You can also paste images (Ctrl+V).
             </p>
         </div>

         {/* New Group Input */}
         {isAddingGroup && (
            <div className="bg-neutral-900 border border-white/10 rounded-xl p-4 animate-scale-in max-w-md">
               <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">New Folder Name</label>
               <div className="flex gap-2">
                  <input
                     type="text"
                     value={newGroupName}
                     onChange={(e) => setNewGroupName(e.target.value)}
                     placeholder="e.g. Batch 2"
                     className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-white/30 outline-none text-sm"
                     autoFocus
                  />
                  <button
                     onClick={handleAddGroup}
                     disabled={!newGroupName.trim()}
                     className="px-3 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-white/90 disabled:opacity-50"
                  >
                     Create
                  </button>
                  <button
                     onClick={() => setIsAddingGroup(false)}
                     className="px-3 py-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>
            </div>
         )}

         {/* Groups List */}
         <div className="space-y-6">
            {groups.length === 0 ? (
               <div className="text-center py-12 bg-neutral-900/40 border border-white/5 rounded-2xl border-dashed">
                  <Folder className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm font-medium">No QC groups yet.</p>
                  <p className="text-neutral-600 text-xs mt-2">Drag and drop images here to create one automatically.</p>
                  <button 
                     onClick={() => setIsAddingGroup(true)}
                     className="mt-4 text-xs text-white underline underline-offset-4 hover:text-neutral-300"
                  >
                     Create manually
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
                                       onClick={() => handleDeleteImage(img.id, group.id)}
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
