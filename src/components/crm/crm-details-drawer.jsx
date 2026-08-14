"use client";

import React, { useState } from "react";
import Drawer from "@/components/ui/drawer";
import {
  Building2,
  Mail,
  Phone,
  CreditCard,
  User,
  Clock,
  Plus,
  PhoneCall,
  Video,
  FileText,
  ShoppingBag,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoredCrmActivities,
  addCrmActivity,
  deleteCrmCustomer,
  deleteLead,
  deleteContact,
  deleteDeal,
} from "@/lib/crm-storage";

export function CrmDetailsDrawer({ isOpen, onClose, record, onConvertLead, onDeleteRecord }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [newLogTitle, setNewLogTitle] = useState("");
  const [newLogDesc, setNewLogDesc] = useState("");
  const [newLogType, setNewLogType] = useState("Call");
  const [isAddingLog, setIsAddingLog] = useState(false);

  if (!record) return null;

  const activities = getStoredCrmActivities(record.id);

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newLogTitle.trim()) {
      toast.error("Please enter a title for the activity.");
      return;
    }

    addCrmActivity({
      id: `act-${Date.now()}`,
      entityId: record.id,
      type: newLogType,
      title: newLogTitle,
      description: newLogDesc || "Activity logged by user.",
      author: record.assignedRep || "Sales Rep",
      timestamp: `${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" })} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    });

    toast.success(`Logged ${newLogType} activity for ${record.name || record.company}`);
    setNewLogTitle("");
    setNewLogDesc("");
    setIsAddingLog(false);
  };

  const handleDeleteEntity = () => {
    if (onDeleteRecord) {
      onDeleteRecord(record);
    } else {
      if (record.stage) {
        deleteLead(record.id);
        deleteDeal(record.id);
      } else {
        deleteCrmCustomer(record.id);
      }
      toast.success(`Deleted ${record.company || record.name || record.title}`);
    }
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      title={`${record.company || record.name || record.title} Details`}
      size="md"
    >
      <div className="space-y-6 pb-6">
        
        {/* Profile Card Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white space-y-3 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-blue-300 uppercase">
                {record.type || (record.stage ? "Sales Lead / Deal" : "Account")}
              </span>
              <h3 className="text-xl font-black tracking-tight">{record.company || record.name || record.title}</h3>
              <p className="text-xs text-slate-300 font-medium">{record.name} • {record.role || record.category || "B2B Entity"}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                record.status === "Active" || record.stage === "Won"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {record.status || record.stage || "Active"}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Valuation / Receivables</span>
              <span className="text-base font-black text-blue-300">{record.outstanding || record.estimatedValue || record.value || "₹0.00"}</span>
            </div>
            <div className="flex items-center gap-2">
              {onConvertLead && (record.stage || record.type === "Customer") && (
                <button
                  onClick={() => onConvertLead(record)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
                >
                  <ShoppingBag size={14} />
                  <span>Create Order</span>
                </button>
              )}
              <button
                onClick={handleDeleteEntity}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm"
                title="Delete this record"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 text-xs font-bold transition ${
              activeTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Overview & Contact Info
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`pb-2.5 text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "activities"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            <span>Activity Log</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {activities.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-xs font-medium">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <Building2 size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Company Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{record.company || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Email Address</span>
                  <a href={`mailto:${record.email}`} className="font-bold text-blue-600 hover:underline">{record.email || "N/A"}</a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone Number</span>
                  <span className="font-bold text-slate-900 dark:text-white">{record.phone || "N/A"}</span>
                </div>
              </div>

              {record.gst && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <CreditCard size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">GSTIN Identification</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{record.gst}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <User size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Sales Executive</span>
                  <span className="font-bold text-slate-900 dark:text-white">{record.assignedRep || "Sarah Jenkins"}</span>
                </div>
              </div>
            </div>

            {record.notes && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
                <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">Internal Notes & History</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{record.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVITIES LOG & TIMELINE */}
        {activeTab === "activities" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Interaction History</span>
              <button
                onClick={() => setIsAddingLog(!isAddingLog)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition"
              >
                <Plus size={14} />
                <span>Log Activity</span>
              </button>
            </div>

            {/* Inline Log Activity Form */}
            {isAddingLog && (
              <form onSubmit={handleAddActivity} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  {["Call", "Meeting", "Email", "Note"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewLogType(type)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        newLogType === type
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  placeholder="Activity Title (e.g. Phone Discussion regarding pricing)..."
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                />

                <textarea
                  rows={2}
                  placeholder="Details / outcome of discussion..."
                  value={newLogDesc}
                  onChange={(e) => setNewLogDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingLog(false)}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            )}

            {/* Timeline Feed */}
            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act.id} className="relative pl-8 space-y-1">
                    <div className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 ring-4 ring-white dark:ring-slate-900">
                      {act.type === "Call" ? (
                        <PhoneCall size={10} />
                      ) : act.type === "Meeting" ? (
                        <Video size={10} />
                      ) : (
                        <FileText size={10} />
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white">{act.title}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{act.timestamp}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{act.description}</p>
                      <span className="text-[10px] font-bold text-slate-400 block pt-1">By {act.author}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-6">
                  No activities recorded yet for this entity.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
