import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'marketing'
  },

  // ---------- Marketing & subscription ----------
  {
    path: 'marketing',
    loadChildren: () => import('./features/marketing/marketing.routes').then(m => m.MARKETING_ROUTES)
  },

  // ---------- Auth ----------
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'doctor/signup',
    loadComponent: () => import('./features/auth/doctor-signup.component').then(m => m.DoctorSignupComponent)
  },

  // ---------- Admin ----------
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadComponent: () => import('./shared/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '',           loadComponent: () => import('./features/admin/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'doctors',    loadComponent: () => import('./features/admin/doctors.component').then(m => m.ManageDoctorsComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/categories.component').then(m => m.ManageCategoriesComponent) },
      { path: 'appointments', loadComponent: () => import('./features/admin/appointments.component').then(m => m.AllAppointmentsComponent) },
      { path: 'payments',   loadComponent: () => import('./features/admin/payments.component').then(m => m.AllPaymentsComponent) },
      { path: 'salary',     loadComponent: () => import('./features/admin/salary.component').then(m => m.SalaryManagementComponent) }
    ]
  },

  // ---------- Doctor ----------
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard('DOCTOR')],
    loadComponent: () => import('./shared/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '',            loadComponent: () => import('./features/doctor/dashboard.component').then(m => m.DoctorDashboardComponent) },
      { path: 'profile',     loadComponent: () => import('./features/doctor/profile.component').then(m => m.DoctorProfileComponent) },
      { path: 'appointments',loadComponent: () => import('./features/doctor/appointments.component').then(m => m.DoctorAppointmentsComponent) },
      { path: 'prescriptions', loadComponent: () => import('./features/doctor/prescriptions.component').then(m => m.DoctorPrescriptionsComponent) },
      { path: 'reports',     loadComponent: () => import('./features/doctor/reports.component').then(m => m.DoctorReportsComponent) },
      { path: 'earnings',    loadComponent: () => import('./features/doctor/earnings.component').then(m => m.DoctorEarningsComponent) }
    ]
  },

  // ---------- Patient ----------
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard('PATIENT')],
    loadComponent: () => import('./shared/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '',            loadComponent: () => import('./features/patient/dashboard.component').then(m => m.PatientDashboardComponent) },
      { path: 'profile',     loadComponent: () => import('./features/patient/profile.component').then(m => m.PatientProfileComponent) },
      { path: 'doctors',     loadComponent: () => import('./features/patient/browse-doctors.component').then(m => m.BrowseDoctorsComponent) },
      { path: 'book',        loadComponent: () => import('./features/patient/book-appointment.component').then(m => m.BookAppointmentComponent) },
      { path: 'appointments',loadComponent: () => import('./features/patient/appointments.component').then(m => m.PatientAppointmentsComponent) },
      { path: 'prescriptions', loadComponent: () => import('./features/patient/prescriptions.component').then(m => m.PatientPrescriptionsComponent) },
      { path: 'reports',     loadComponent: () => import('./features/patient/reports.component').then(m => m.PatientReportsComponent) },
      { path: 'payments',    loadComponent: () => import('./features/patient/payments.component').then(m => m.PatientPaymentsComponent) }
    ]
  },

  // ---------- Fallback ----------
  { path: '**', redirectTo: '' }
];