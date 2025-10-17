# 🌐 Custom Domain Setup Guide

## Using Your Own Domain (Without .netlify.app)

You can use your own custom domain (e.g., `yourlucklab.com`) with any hosting provider.

---

## Option 1: Netlify with Custom Domain (Easiest)

### Step 1: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag & drop your `lucklab-frontend` folder
3. Your site will get a temporary URL like `random-name.netlify.app`

### Step 2: Add Your Custom Domain
1. In Netlify dashboard, click on your site
2. Go to **"Domain settings"** → **"Custom domains"**
3. Click **"Add custom domain"**
4. Enter your domain: `yourdomain.com`
5. Netlify will provide you with DNS records

### Step 3: Update Your Domain's DNS
Go to your domain registrar (GoDaddy, Namecheap, etc.) and add these DNS records:

**For Root Domain (yourdomain.com):**
```
Type: A
Name: @
Value: 75.2.60.5 (Netlify's IP)
TTL: Automatic
```

**For WWW (www.yourdomain.com):**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
TTL: Automatic
```

### Step 4: Enable HTTPS (Automatic)
- Netlify will automatically provide a free SSL certificate
- Your site will be accessible at `https://yourdomain.com`

**Done!** Your custom domain is live! 🎉

---

## Option 2: Vercel with Custom Domain

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your `lucklab-frontend` folder
3. Your site will get a temporary URL like `your-project.vercel.app`

### Step 2: Add Your Custom Domain
1. In Vercel dashboard, go to **"Domains"**
2. Click **"Add"**
3. Enter your domain: `yourdomain.com`

### Step 3: Update DNS
Vercel will provide you with DNS records to add:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Done!** Your custom domain is live! 🎉

---

## Option 3: Traditional Web Hosting (Full Control)

If you already have web hosting (e.g., GoDaddy, Bluehost, HostGator):

### Step 1: Upload Files
1. Log into your hosting control panel (cPanel)
2. Open **File Manager**
3. Go to `public_html` folder
4. Upload entire `lucklab-frontend` folder contents

### Step 2: Point Domain
1. In your hosting panel, go to **"Domains"**
2. Make sure your domain points to `public_html`
3. If needed, update DNS A record to your hosting IP

**Done!** Your custom domain is live! 🎉

---

## Common Domain Registrars - DNS Setup

### GoDaddy
1. Log in to GoDaddy
2. Go to **"My Products"** → **"DNS"**
3. Add the A and CNAME records provided by Netlify/Vercel
4. Save changes

### Namecheap
1. Log in to Namecheap
2. Go to **"Domain List"** → Click your domain
3. Go to **"Advanced DNS"**
4. Add the A and CNAME records
5. Save changes

### Google Domains
1. Log in to Google Domains
2. Click your domain → **"DNS"**
3. Add **Custom records**
4. Add the A and CNAME records
5. Save changes

---

## DNS Propagation Time

After updating DNS records:
- **Minimum**: 5-10 minutes
- **Average**: 1-2 hours
- **Maximum**: 24-48 hours

**Tip**: Use [dnschecker.org](https://dnschecker.org) to check if your DNS has propagated worldwide.

---

## Troubleshooting

### Domain Not Working?
- Check DNS records are correct
- Wait for DNS propagation (up to 48 hours)
- Clear browser cache
- Try incognito/private mode

### SSL Certificate Not Working?
- Most providers (Netlify, Vercel) auto-provision SSL
- This can take 5-10 minutes after DNS is configured
- Force HTTPS in your hosting settings

### Backend Not Connecting?
- Make sure your PC backend is running
- Verify IP address is correct in `insightai.js`
- Check firewall settings on your PC

---

## Recommended Setup (My Preference)

**Best for Easy Setup**: Netlify
- ✅ Free SSL certificate
- ✅ Auto-deploys from Git
- ✅ Easy custom domain setup
- ✅ CDN included (fast worldwide)
- ✅ Free tier is generous

**Best for Developers**: Vercel
- ✅ Similar to Netlify
- ✅ Great performance
- ✅ Easy GitHub integration

**Best for Full Control**: Traditional Hosting
- ✅ Complete control
- ✅ More configuration options
- ✅ Can host backend too (if needed)

---

## Your Current Setup

**Local IP**: 192.168.1.102
**Backend Ports**: 5002, 5003, 5004

**To Deploy:**
1. Choose hosting provider above
2. Upload `lucklab-frontend` folder
3. Add your custom domain
4. Update DNS records
5. Start your backend: `START-EVERYTHING.bat`

**Your website will be live at your custom domain!** 🚀

---

**Need Help?**
- Netlify Docs: [docs.netlify.com/domains-https/custom-domains](https://docs.netlify.com/domains-https/custom-domains/)
- Vercel Docs: [vercel.com/docs/concepts/projects/custom-domains](https://vercel.com/docs/concepts/projects/custom-domains)
- DNS Checker: [dnschecker.org](https://dnschecker.org)
