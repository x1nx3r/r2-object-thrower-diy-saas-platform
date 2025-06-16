# DIY R2 Thrower SaaS

A file upload service masquerading as a SaaS because apparently everything needs to be a service now. Built with Next.js, Firebase, and the questionable decision to manage other people's cloud storage credentials. Features user authentication, encrypted credential storage, and the constant anxiety of handling other people's data.

This exists because I thought "what if Dropbox, but worse and with more moving parts?" Turns out the answer is "a lot of late nights and database design regret."

## What This Actually Does

It's a web app that lets people upload files to their own Cloudflare R2 buckets through your interface. Think of it as a middleman for a service that already has a perfectly good web interface. Users give you their R2 credentials, you encrypt them (hopefully correctly), and then facilitate uploads they could have done themselves.

### Authentication (Because Everything Needs Accounts Now)
- Firebase Authentication because rolling your own auth is how you end up in security blogs
- Email/password signup for people who don't trust Google
- Google OAuth for people who've already given up on privacy
- JWT tokens floating around doing JWT things
- User profiles automatically created in Firestore because that seemed logical at 2 AM

### R2 Storage Management (The Questionable Part)
- Users can add multiple R2 accounts because apparently one cloud storage provider isn't enough
- Credentials encrypted with AES-256-GCM and stored in your database
- You're now responsible for other people's cloud storage access keys
- Presigned URLs because having files route through your server is expensive
- Public URL generation for when people want to share their uploads

### File Management (The Actually Useful Bit)
- Drag and drop upload interface that works 80% of the time
- File browser with grid and list views because users have opinions about how to view rectangles
- Image previews using Next.js Image optimization
- File operations like download, copy link, delete
- Right-click context menus for people who remember those exist
- Search and sorting because finding files is apparently difficult

### UI/UX (Making It Look Professional)
- Tailwind CSS because writing actual CSS is for people with time
- Responsive design that works on phones for some reason
- Custom logo with gradients because it's not 2015
- Loading states to hide the fact that everything takes longer than expected
- Error handling that tries to be helpful instead of cryptic
- Dark mode support that nobody asked for but everyone expects

### Dashboard (Because Data Needs Homes)
- User statistics showing how much they've uploaded and stored
- Activity feed of recent uploads because people like seeing lists of things they did
- Account management for the three settings users actually care about
- Debug console for when everything inevitably breaks

## Getting Started (Good Luck)

### Prerequisites (Things You Need First)
- Node.js 18+ because 16 is deprecated and 20 isn't quite stable enough
- A Firebase project with Authentication and Firestore enabled
- Cloudflare R2 bucket and API credentials
- The patience to set up approximately 47 environment variables
- A questionable amount of trust in your own encryption implementation

### Step 1: Clone This Monument to Overengineering
```bash
git clone https://github.com/yourusername/diy-r2-thrower-saas.git
cd diy-r2-thrower-saas
npm install
# watch npm install 400MB of dependencies for a file upload app
```

### Step 2: Environment Variable Hell
Create `.env.local` and prepare for configuration fatigue:

```bash
# Firebase Configuration (from their console that reorganizes itself monthly)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Encryption key for storing other people's credentials (no pressure)
ENCRYPTION_KEY=your_64_character_hex_encryption_key_that_better_be_random

# Firebase Admin SDK (because client SDK wasn't complicated enough)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_SERVICE_ACCOUNT_KEY=base64_encoded_service_account_json_blob
```

### Step 3: Firebase Configuration (The Fun Part)
Navigate Firebase's console that changes layout every time you visit it:

1. Enable Email/Password and Google auth providers
2. Add your domain to authorized domains (localhost:3000 for development because Firebase is helpful like that)
3. Set up Firestore with security rules that actually make sense:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only see their own stuff (revolutionary concept)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Their encrypted R2 credentials
      match /r2Credentials/{credentialId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Their uploaded file records
      match /files/{fileId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

4. Generate a service account key from Project Settings → Service Accounts
5. Base64 encode the JSON file because apparently that's how we pass credentials now
6. Add it to your environment variables and hope nobody finds your .env file

### Step 4: Run the Development Server
```bash
npm run dev
# navigate to localhost:3000
# marvel at what modern web development has become
```

## Project Structure (Or: How to Organize Chaos)

```
diy-r2-thrower-saas/
├── src/
│   ├── app/                    # Next.js App Router (because Pages Router is old)
│   │   ├── api/               # API Routes that handle the heavy lifting
│   │   ├── auth/              # Login/signup page
│   │   ├── dashboard/         # The main event
│   │   └── page.js            # Landing page nobody reads
│   ├── components/            # React Components organized by anxiety level
│   │   ├── ui/               # Basic UI building blocks
│   │   ├── dashboard/        # Dashboard-specific stuff
│   │   ├── upload/           # File upload magic
│   │   └── debug/            # For when things go wrong
│   └── lib/                  # Utilities and configurations
│       ├── api/              # Client-side API wrappers
│       ├── encryption.js     # Credential encryption (please work)
│       ├── firebase.js       # Firebase client setup
│       └── firebase-admin.js # Firebase server setup
```

## API Documentation (For the Curious)

All API routes require a Firebase ID token because security theater:
```
Authorization: Bearer <firebase-id-token>
```

### R2 Credentials Management
- `GET /api/r2-credentials` - List user's stored credentials
- `POST /api/r2-credentials` - Save new credentials (encrypt and pray)
- `DELETE /api/r2-credentials/[id]` - Remove credentials (goodbye data)

### File Operations
- `GET /api/files` - List user's uploaded files
- `POST /api/files` - Generate presigned upload URLs
- `DELETE /api/files/[id]` - Delete files from existence
- `GET /api/files/[id]/download` - Get download URLs

## Configuration (More Things to Get Wrong)

### R2 Credentials Format
Users need to provide these details from their Cloudflare dashboard:
```javascript
{
  name: "My R2 Account",           // Whatever they want to call it
  accessKeyId: "your_access_key",  // From R2 API tokens page
  secretAccessKey: "your_secret",  // Also from R2 API tokens page
  bucket: "my-bucket",             // The bucket name they created
  s3Endpoint: "https://account-id.r2.cloudflarestorage.com", // R2 S3 API endpoint
  publicDomain: "https://files.example.com" // Custom domain if they're fancy
}
```

### Encryption Details
Credentials are encrypted using AES-256-GCM before hitting Firestore. The encryption key needs to be a 64-character hex string that you definitely generated securely and didn't just mash the keyboard.

## Deployment (Making It Someone Else's Problem)

### Vercel (The Path of Least Resistance)
1. Connect your GitHub repo to Vercel
2. Add all environment variables in their dashboard
3. Deploy and hope it works in production
4. Debug why it doesn't work in production
5. Repeat until successful or you give up

### Production Environment Variables
Same as development but with production Firebase project and a different encryption key that you definitely backed up somewhere safe.

## Security (Attempt at Responsibility)

- R2 credentials encrypted with AES-256-GCM because plaintext is for development only
- Firebase security rules that actually restrict access
- HTTPS everywhere because it's not 2005
- JWT token validation on every API request
- Input validation that hopefully catches the obvious attacks
- CORS configuration that may or may not be correct

## How People Actually Use This

### Adding R2 Credentials
1. Users go to Dashboard → R2 Credentials Manager
2. Click "Add New Credentials" and fill out the form
3. Hope they copied their credentials correctly from Cloudflare
4. Cross fingers that the encryption works

### Uploading Files
1. Make sure they have credentials configured first
2. Use the upload interface that may or may not accept their files
3. Watch files upload directly to R2 via presigned URLs
4. Marvel at the complexity of uploading a file in 2024

### Managing Files
- Browse files in grid or list view because preferences matter
- Search through files they forgot they uploaded
- Preview images that are actually images
- Download files they just uploaded
- Copy public URLs to share with people
- Delete files when they realize cloud storage costs money

## Troubleshooting (When It All Falls Apart)

**"Failed to load R2 credentials"**
- Your encryption key is probably wrong
- Firebase service account permissions are misconfigured
- Firestore security rules are blocking legitimate requests
- The universe is testing your patience

**"Upload failed"**
- R2 credentials are incorrect or expired
- Bucket permissions are wrong in Cloudflare
- S3 endpoint URL has a typo
- CORS is configured incorrectly on the bucket

**"Authentication error"**
- Firebase configuration is wrong
- User token expired
- API routes aren't receiving the token properly
- Firebase is having a bad day

### Debug Console
Press Ctrl+Shift+D to open the debug console and see:
- What's actually happening with authentication
- API requests and their responses
- Error logs that might be helpful
- Performance metrics that show how slow everything is

## Contributing (If You're Brave)

1. Fork the repository
2. Create a feature branch with a descriptive name
3. Make changes that probably break something else
4. Write tests if you remember to
5. Open a pull request and explain what you were trying to accomplish

## License

MIT License because who has time for complicated licensing. Use it, modify it, break it, fix it, sell it. Just don't blame me when it doesn't work or when your users complain about the interface.

## Final Thoughts

This project exists because I thought it would be simple to build a file upload service. It wasn't. What started as a weekend project turned into a full authentication system, encryption implementation, and credential management service.

The code works well enough for my needs and maybe yours too. It handles other people's data with reasonable care and encrypts their credentials before storing them. The UI is functional if not revolutionary, and the upload system works most of the time.

If you use this in production, test it thoroughly first. If you find bugs, fix them or learn to live with them. If you need features, add them yourself or convince someone else to do it.

The encryption is probably secure, the authentication definitely works, and the file uploads succeed more often than they fail. In the context of modern web development, that's basically bulletproof.

Remember: you're now responsible for other people's cloud storage credentials. Sleep tight.
