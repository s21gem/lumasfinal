import React, { useEffect, useState } from 'react';
import { FolderKanban, Users, MessageSquare, Zap, GitBranch, Award, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    team: 0,
    testimonials: 0,
    services: 0,
    process: 0,
    brands: 0,
    messages: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const [projectsRes, teamRes, testimonialsRes, servicesRes, processRes, brandsRes, messagesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/team'),
          fetch('/api/testimonials/all'),
          fetch('/api/services'),
          fetch('/api/process'),
          fetch('/api/trusted-brands'),
          fetch('/api/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);

        const projects = projectsRes.ok ? await projectsRes.json() : [];
        const team = teamRes.ok ? await teamRes.json() : [];
        const testimonials = testimonialsRes.ok ? await testimonialsRes.json() : [];
        const services = servicesRes.ok ? await servicesRes.json() : [];
        const process = processRes.ok ? await processRes.json() : [];
        const brands = brandsRes.ok ? await brandsRes.json() : [];
        const messages = messagesRes.ok ? await messagesRes.json() : [];

        setStats({
          projects: projects.length,
          team: team.length,
          testimonials: testimonials.length,
          services: services.length,
          process: process.length,
          brands: brands.length,
          messages: messages.filter((m: any) => !m.isRead).length,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'New Messages', value: stats.messages, icon: Mail, link: '/admin/messages', color: 'bg-blue-500' },
    { title: 'Total Projects', value: stats.projects, icon: FolderKanban, link: '/admin/projects', color: 'bg-cyan-500' },
    { title: 'Team Members', value: stats.team, icon: Users, link: '/admin/team', color: 'bg-fuchsia-500' },
    { title: 'Testimonials', value: stats.testimonials, icon: MessageSquare, link: '/admin/testimonials', color: 'bg-emerald-500' },
    { title: 'Services', value: stats.services, icon: Zap, link: '/admin/services', color: 'bg-amber-500' },
    { title: 'Process Steps', value: stats.process, icon: GitBranch, link: '/admin/process', color: 'bg-violet-500' },
    { title: 'Trusted Brands', value: stats.brands, icon: Award, link: '/admin/trusted-brands', color: 'bg-rose-500' },
  ];

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-1">{card.title}</p>
                <h3 className="text-4xl font-black">{card.value}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
