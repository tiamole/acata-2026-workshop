# Local Windows Credential Manager helper. Never stores plaintext in the checkout.
if (-not ('AcataCredentialStore' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
public static class AcataCredentialStore {
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    private struct Credential {
        public uint Flags, Type;
        public string TargetName, Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public uint CredentialBlobSize;
        public IntPtr CredentialBlob;
        public uint Persist, AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias, UserName;
    }
    [DllImport("advapi32.dll", EntryPoint="CredWriteW", CharSet=CharSet.Unicode, SetLastError=true)]
    private static extern bool CredWrite(ref Credential credential, uint flags);
    [DllImport("advapi32.dll", EntryPoint="CredReadW", CharSet=CharSet.Unicode, SetLastError=true)]
    private static extern bool CredRead(string target, uint type, uint flags, out IntPtr credential);
    [DllImport("advapi32.dll")] private static extern void CredFree(IntPtr pointer);
    public static void Save(string target, string value) {
        IntPtr blob=Marshal.StringToCoTaskMemUni(value);
        try {
            var item=new Credential { Type=1, TargetName=target, Comment="ACATA workshop service secrets", CredentialBlobSize=(uint)Encoding.Unicode.GetByteCount(value), CredentialBlob=blob, Persist=2, UserName="tiamole" };
            if(!CredWrite(ref item,0)) throw new Win32Exception(Marshal.GetLastWin32Error());
        } finally { Marshal.ZeroFreeCoTaskMemUnicode(blob); }
    }
    public static string Load(string target) {
        IntPtr pointer;
        if(!CredRead(target,1,0,out pointer)) {
            int error=Marshal.GetLastWin32Error();
            if(error==1168) return null;
            throw new Win32Exception(error);
        }
        try {
            var item=(Credential)Marshal.PtrToStructure(pointer,typeof(Credential));
            return Marshal.PtrToStringUni(item.CredentialBlob,(int)item.CredentialBlobSize/2);
        } finally { CredFree(pointer); }
    }
}
'@
}
$AcataCredentialTarget='ACATA2026Workshop/CloudflareSecrets'
