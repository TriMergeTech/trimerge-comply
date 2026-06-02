export interface UploadedBySnapshot {
  userId: string | null;
  email: string;
  companyName: string | null;
  role: string | null;
}

export function getUploadedBy(user?: any): UploadedBySnapshot {
  if (!user) {
    return {
      userId: null,
      email: 'System Upload',
      companyName: null,
      role: null,
    };
  }

  return {
    userId: user.id || user._id || null,
    email: user.email || 'Unknown User',
    companyName: user.companyName || null,
    role: user.role || null,
  };
}

export function getUploaderLabel(uploadedBy?: any): string {
  return uploadedBy?.email || 'System Upload';
}
