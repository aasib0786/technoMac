const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const adminRoute = require('./routes/Admin');
const bannerRoute = require('./routes/Banner');
const ContactRoute = require('./routes/Contact');
const contactInfoRoute = require('./routes/ContactInfo');
const faqRoute = require('./routes/Faq');
const { categoryRouter } = require('./routes/category');
const { parentCategoryRouter } = require('./routes/ParentCategory')
const { subCategoryRouter } = require('./routes/subCategory');
const { productRouter } = require('./routes/Product');
const warrantyRoute = require('./routes/Warrenty');
const certificateRoute = require('./routes/Certificate');
const catalogueRoute = require('./routes/Catalogue');
const catelogurDownloadRoute = require('./routes/CatalogueDownload');
const newUpdateRoutes = require('./routes/NewUpdate');
const subscriberRoute = require('./routes/Subscriber');
const testimonialRoute = require('./routes/Testimonial');
const clientRoute = require('./routes/Client');
const callBackRoute = require('./routes/CallBack');
const blogRoute = require('./routes/Blog');

const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    try {
      const { Product } = require('./models/Product');
      await Product.collection.dropIndex('model_1');
      console.log('Dropped legacy model_1 index from products collection');
    } catch (e) {
      // IndexNotFound is expected if already dropped
    }

    // Auto seed initial blogs if collection is empty
    try {
      const Blog = require('./models/Blog');
      const count = await Blog.countDocuments();
      if (count === 0) {
        await Blog.insertMany([
          {
            title: 'How Advanced Dental Chairs Improve Patient Comfort',
            slug: 'advanced-dental-chair',
            category: 'Dental Chair',
            description: 'Modern dental chairs are transforming clinic experiences for patients and dentists.',
            content: 'Advanced dental chairs improve ergonomics, patient positioning and workflow efficiency. Modern features provide comfort and improve treatment quality.',
            author: 'TechnoMac Team',
            readTime: '4 min read',
            isActive: true,
            isFeatured: true,
          },
          {
            title: 'Modern Imaging Solutions For Dental Clinics',
            slug: 'modern-imaging-solutions',
            category: 'Imaging',
            description: 'Discover the latest imaging systems used by modern dental professionals.',
            content: 'Digital imaging systems help dentists diagnose accurately and improve treatment planning using advanced technology.',
            author: 'TechnoMac Team',
            readTime: '5 min read',
            isActive: true,
            isFeatured: false,
          },
          {
            title: 'Importance Of Sterilization In Clinics',
            slug: 'importance-of-sterilization',
            category: 'Sterilization',
            description: 'Proper sterilization keeps clinics safe and hygienic for every patient.',
            content: 'Autoclaves and sterilization systems play an important role in maintaining hygiene and infection control.',
            author: 'TechnoMac Team',
            readTime: '3 min read',
            isActive: true,
            isFeatured: false,
          },
          {
            title: 'Future Of Smart Dental Equipment',
            slug: 'future-of-dental-equipment',
            category: 'Technology',
            description: 'Explore how smart dental devices are changing healthcare technology.',
            content: 'AI-powered systems and digital dentistry are shaping the future of modern clinics.',
            author: 'TechnoMac Team',
            readTime: '6 min read',
            isActive: true,
            isFeatured: true,
          },
        ]);
        console.log('Initial Blog data seeded successfully');
      }
    } catch (err) {
      console.error('Blog seeding error:', err.message);
    }
  })
  .catch((err) => {
    console.log(err);
  });

app.use('/uploads', express.static('uploads'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRoute);
app.use('/api/banner', bannerRoute);
app.use('/api/contact', ContactRoute);
app.use('/api/contact-info', contactInfoRoute);
app.use('/api/category', categoryRouter);
app.use('/api/parentCategory', parentCategoryRouter)
app.use('/api/sub-category', subCategoryRouter);
app.use('/api/product', productRouter);
app.use('/api/warranty', warrantyRoute);
app.use('/api/faq', faqRoute);
app.use('/api/certificate', certificateRoute);
app.use('/api/catalogue', catalogueRoute);
app.use('/api/catalogueDownload', catelogurDownloadRoute);
app.use('/api/newupdate', newUpdateRoutes);
app.use('/api/subscribe', subscriberRoute);
app.use('/api/testimonial', testimonialRoute);
app.use('/api/client', clientRoute);
app.use('/api/callback', callBackRoute);
app.use('/api/blog', blogRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
