# DIY R2 Thrower SaaS 🚀

A modern, full-stack SaaS application for managing Cloudflare R2 storage with a beautiful UI, secure file uploads, and seamless user experience.

![R2 Thrower](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange?style=for-the-badge&logo=firebase)
![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2%20Storage-orange?style=for-the-badge&logo=cloudflare)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🔐 Authentication
- **Firebase Authentication** with email/password and Google OAuth
- Secure user sessions with JWT tokens
- Protected API routes with Firebase Admin SDK
- Automatic user profile creation in Firestore

### 📁 R2 Storage Management
- **Multiple R2 Credentials** - Manage multiple Cloudflare R2 accounts
- **Encrypted Storage** - All R2 credentials encrypted at rest
- **Presigned Upload URLs** - Direct browser-to-R2 uploads
- **Public URL Generation** - Automatic public URL creation for files

### 🌟 File Management
- **Drag & Drop Upload** - Modern file upload interface
- **File Browser** - Grid and list view with search and sorting
- **Image Previews** - Built-in image preview with Next.js Image optimization
- **File Operations** - Download, copy links, delete files
- **Context Menu** - Right-click context menu for file actions

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Custom Logo & Branding** - Animated logo with gradient design
- **Dark Mode Ready** - CSS custom properties for theming
- **Loading States** - Beautiful loading animations and skeletons
- **Error Handling** - User-friendly error messages and recovery

### 📊 Dashboard Features
- **User Statistics** - Upload counts, storage usage, credentials
- **Activity Feed** - Recent uploads and file operations
- **Account Management** - Profile settings and billing info
- **Debug Console** - Development debugging tools

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Cloudflare R2 bucket and API credentials

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/diy-r2-thrower-saas.git
cd diy-r2-thrower-saas
npm install
```

### 2. Environment Setup
Create `.env.local` in the project root:

```bash
# Firebase Configuration (from Firebase Console -> Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Encryption key for R2 credentials (generate a 64-character hex string)
ENCRYPTION_KEY=your_64_character_hex_encryption_key

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_SERVICE_ACCOUNT_KEY=base64_encoded_service_account_json
```

### 3. Firebase Setup

#### Authentication
1. Enable Email/Password and Google providers in Firebase Console
2. Add your domain to authorized domains

#### Firestore Database
Create these collections with security rules:
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // User's R2 credentials
      match /r2Credentials/{credentialId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // User's files
      match /files/{fileId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

#### Service Account
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Base64 encode the JSON file: `base64 -i serviceAccount.json`
4. Add to `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
diy-r2-thrower-saas/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── files/         # File management endpoints
│   │   │   └── r2-credentials/ # R2 credentials CRUD
│   │   ├── auth/              # Authentication page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── globals.css        # Global styles
│   │   ├── layout.js          # Root layout
│   │   └── page.js            # Landing page
│   ├── components/            # React Components
│   │   ├── ui/               # UI components (Logo, etc.)
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── upload/           # File upload & browser
│   │   ├── debug/            # Debug console
│   │   └── AuthForm.js       # Authentication form
│   └── lib/                  # Utilities & Config
│       ├── api/              # Client-side API functions
│       ├── auth-context.js   # Authentication context
│       ├── encryption.js     # Credential encryption
│       ├── firebase.js       # Firebase client config
│       └── firebase-admin.js # Firebase admin config
├── .env.local                # Environment variables
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies
└── tailwind.config.js       # Tailwind CSS config
```

## 🔧 API Endpoints

### Authentication
All API routes require Firebase ID token in Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### R2 Credentials
- `GET /api/r2-credentials` - List user's R2 credentials
- `POST /api/r2-credentials` - Save new R2 credentials
- `DELETE /api/r2-credentials/[id]` - Delete R2 credentials

### File Management
- `GET /api/files` - List user's files
- `POST /api/files` - Generate presigned upload URL
- `DELETE /api/files/[id]` - Delete file
- `GET /api/files/[id]/download` - Get download URL

## 🛠️ Configuration

### R2 Credentials Format
```javascript
{
  name: "My R2 Account",           // Display name
  accessKeyId: "your_access_key",  // R2 Access Key ID
  secretAccessKey: "your_secret",  // R2 Secret Access Key
  bucket: "my-bucket",             // R2 Bucket name
  s3Endpoint: "https://account-id.r2.cloudflarestorage.com", // R2 S3 API endpoint
  publicDomain: "https://files.example.com" // Optional: Custom domain for public URLs
}
```

### Encryption
R2 credentials are encrypted using AES-256-GCM before storing in Firestore. The encryption key should be a secure 64-character hexadecimal string.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```bash
# Same as development, but use production Firebase project
NEXT_PUBLIC_FIREBASE_API_KEY=prod_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prod-project.firebaseapp.com
# ... other Firebase config

# Use a strong, unique encryption key for production
ENCRYPTION_KEY=production_encryption_key_64_chars

# Production Firebase service account
FIREBASE_SERVICE_ACCOUNT_KEY=base64_encoded_prod_service_account
```

## 🔒 Security Features

- **Encrypted Credentials**: All R2 credentials encrypted with AES-256-GCM
- **Firebase Security Rules**: User data isolation in Firestore
- **HTTPS Only**: All communication over HTTPS
- **JWT Authentication**: Secure API access with Firebase ID tokens
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Proper CORS configuration for API routes

## 🎯 Usage

### Adding R2 Credentials
1. Go to Dashboard → R2 Credentials Manager
2. Click "Add New Credentials"
3. Fill in your Cloudflare R2 details:
   - Access Key ID and Secret from R2 dashboard
   - Bucket name
   - S3 endpoint (account-specific URL)
   - Optional: Custom domain for public URLs

### Uploading Files
1. Ensure you have R2 credentials configured
2. Use the Upload Manager in dashboard
3. Drag & drop files or click to browse
4. Files upload directly to R2 via presigned URLs

### Managing Files
- **View Files**: Grid or list view in File Browser
- **Search**: Find files by name
- **Sort**: By date, name, size, or type
- **Preview**: Click images for full preview
- **Download**: Right-click → Download
- **Share**: Copy public URL to clipboard
- **Delete**: Remove files from R2 storage

## 🛟 Troubleshooting

### Common Issues

**"Failed to load R2 credentials"**
- Check encryption key is exactly 64 hex characters
- Verify Firebase service account permissions
- Check Firestore security rules

**"Upload failed"**
- Verify R2 credentials are correct
- Check bucket permissions in Cloudflare dashboard
- Ensure S3 endpoint URL is correct

**"Authentication error"**
- Verify Firebase configuration
- Check if user is properly authenticated
- Ensure API routes receive valid ID token

### Debug Console
Enable debug console in development by pressing `Ctrl+Shift+D` to see:
- Authentication state
- API request/response details
- Error logs
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Firebase](https://firebase.google.com/) - Authentication and database
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - Object storage
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) - S3-compatible client for R2

---

**Built with ❤️ for the developer community**
