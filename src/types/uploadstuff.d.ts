/* eslint-disable @typescript-eslint/no-explicit-any */

// Override @xixixao/uploadstuff types for React 19 compatibility
// The package ships raw .tsx files which use React 18 useRef() API
declare module "@xixixao/uploadstuff/react" {
  export function useUploadFiles(
    generateUploadUrl: any,
    options?: {
      onUploadComplete?: (uploaded: { response: any; name: string }[]) => void;
      onUploadError?: (error: unknown) => void;
      onUploadBegin?: (fileName: string) => void;
    },
  ): {
    startUpload: (files: File[]) => Promise<void>;
    isUploading: boolean;
  };
}
