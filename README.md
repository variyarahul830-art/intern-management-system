# 🎓 Intern Management System

A complete, production-ready Intern Management System built with modern web technologies. Designed to manage internship workflows with role-based access control for Admins, Mentors, and Interns.

## 🌟 Key Features

### ✅ Role-Based Dashboards
- **Admin**: Manage interns, create tasks, view analytics
- **Mentor**: Manage assigned interns, assign tasks, review reports
- **Intern**: View tasks, submit reports, track progress

### 🔐 Secure Authentication
- Email/password login with bcryptjs hashing
- JWT-based session management
- Automatic role-based redirects
- Protected routes with middleware

### 📊 Complete Feature Set
- Intern management (CRUD operations)
- Task assignment and tracking
- Report submission and feedback system
- User role management
- Statistics and analytics dashboard

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd intern-management-system

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@internship.com | password |
| **Mentor** | mentor@internship.com | password |
| **Intern** | intern@internship.com | password |

## 📁 Project Structure

```
intern-management-system/
├── app/
│   ├── api/                    # API Routes (CRUD operations)
│   ├── auth/                   # Authentication pages
│   ├── components/             # Reusable React components
│   ├── dashboard/              # Role-specific dashboards
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   └── db.ts                   # JSON file operations
├── data/                       # JSON data storage
│   ├── users.json
│   ├── interns.json
│   ├── tasks.json
│   └── reports.json
├── middleware.ts               # Route protection
├── DOCUMENTATION.md            # Comprehensive docs
├── IMPLEMENTATIONS_GUIDE.md    # Developer guide
└── ARCHITECTURE.md             # System architecture
```

## 🏗️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Storage**: JSON files (no database required)
- **Language**: TypeScript
- **Security**: bcryptjs for password hashing

## 📚 Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete feature documentation and API reference
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation details
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns

## 🎯 Core Workflows

### Admin Workflow
1. Login to admin dashboard
2. Manage interns (add, edit, delete)
3. Assign mentors to interns
4. Create and monitor tasks
5. View system statistics

### Mentor Workflow
1. Login to mentor dashboard
2. View assigned interns
3. Assign tasks to interns
4. Review intern reports
5. Provide constructive feedback

### Intern Workflow
1. Login to intern dashboard
2. View assigned tasks
3. Submit daily/weekly reports
4. View mentor feedback
5. Track personal progress

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get all users

### Interns (Admin Only)
- `GET /api/interns` - Get all interns
- `POST /api/interns` - Create intern
- `PUT /api/interns/[id]` - Update intern
- `DELETE /api/interns/[id]` - Delete intern

### Tasks (Role-based)
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create task (Admin/Mentor)
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Reports (Role-based)
- `GET /api/reports` - Get reports (filtered by role)
- `POST /api/reports` - Submit report (Interns)
- `PUT /api/reports/[id]` - Add feedback (Mentors)

## 📊 Data Schema

### Users
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "bcryptjs_hash",
  "role": "admin|mentor|intern"
}
```

### Interns
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "department": "string",
  "mentorId": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "status": "active|inactive"
}
```

### Tasks
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "assignedIntern": "string",
  "deadline": "YYYY-MM-DD",
  "status": "pending|in-progress|completed",
  "priority": "low|medium|high"
}
```

### Reports
```json
{
  "id": "string",
  "internId": "string",
  "date": "YYYY-MM-DD",
  "workDescription": "string",
  "hoursWorked": "number",
  "mentorFeedback": "string"
}
```

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Middleware route protection
- ✅ Secure session management

## 🚢 Production Deployment

### Build and Run
```bash
npm run build
npm run start
```

### Environment Variables (Optional)
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
```

### Deployment Platforms
- Vercel (recommended for Next.js)
- Netlify
- AWS
- Digital Ocean
- Heroku

### Production Considerations
- Migrate JSON storage to PostgreSQL or MongoDB
- Implement caching (Redis)
- Set up email notifications
- Add monitoring and logging
- Configure SSL/TLS

## 📈 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] File upload support
- [ ] Email notifications
- [ ] PDF report generation
- [ ] Advanced analytics
- [ ] Attendance tracking
- [ ] Performance ratings
- [ ] Bulk import/export

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is provided as an educational example. Feel free to use and modify for your needs.

## 🆘 Support & Troubleshooting

### Login Issues
- Verify `data/users.json` exists with correct structure
- Check password is correctly hashed
- Review browser console for errors

### API Errors
- Check user authentication status
- Verify role-based permissions
- Review server logs for errors

### Build Issues
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check TypeScript errors: `npm run build`

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🙏 Acknowledgments

Built with modern best practices using:
- Next.js 16 with App Router
- NextAuth.js for authentication
- Tailwind CSS for styling
- TypeScript for type safety

---

**Happy coding! 🚀**

For more detailed information, see the [DOCUMENTATION.md](./DOCUMENTATION.md), [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md), and [ARCHITECTURE.md](./ARCHITECTURE.md) files.
