import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { TicketItem } from '../types';

interface CreateTicketViewProps {
  onTicketCreated: () => Promise<void>;
  onSelectTicket: (ticket: TicketItem) => void;
  onNavigateAllTickets: () => void;
}

interface CreatedResult {
  ticket: TicketItem;
  classification: {
    ticketId: string;
    detectedCategory: string;
    assignedTeam: string;
    assignedAgent: string;
    currentStatus: string;
    matchedKeywords: string[];
    ruleExplanation: string;
  };
}

export const CreateTicketView: React.FC<CreateTicketViewProps> = ({
  onTicketCreated,
  onSelectTicket,
  onNavigateAllTickets,
}) => {
  // Strictly manual inputs — never pre-filled, never dropdowns
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  const [livePreview, setLivePreview] = useState<{
    category: string;
    assignedTeam: string;
    matchedKeywords: string[];
    ruleExplanation: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<CreatedResult | null>(null);

  // Automatic live category classification from problem description/title
  useEffect(() => {
    const combined = `${title} ${description}`.trim();
    if (!combined) {
      setLivePreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });
        if (res.ok) {
          const data = await res.json();
          setLivePreview(data);
        }
      } catch {
        // Ignore transient preview errors
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [title, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter customer name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail.trim())) {
      setErrorMsg('Please enter a valid email.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter problem title.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please enter ticket description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          title: title.trim(),
          description: description.trim(),
          priority,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setErrorMsg(payload.error || 'Unable to create ticket. Please try again.');
        return;
      }

      setCreatedResult(payload);
      await onTicketCreated();
    } catch {
      setErrorMsg('Unable to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setCustomerEmail('');
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setErrorMsg('');
    setCreatedResult(null);
    setLivePreview(null);
  };

  // Sample problem text templates ONLY populate problem title & description (never customer name/email)
  const sampleProblemTemplates = [
    {
      label: 'Payment Issue',
      title: 'Order not confirmed after payment deduction',
      description: 'My payment was deducted but my order was not confirmed.',
    },
    {
      label: 'Technical Crash',
      title: 'Application crashes on login',
      description: 'The application crashes whenever I try to login.',
    },
    {
      label: 'Refund Delay',
      title: 'Refund not received in bank account',
      description: 'I requested a refund but I have not received it.',
    },
    {
      label: 'Delivery Delay',
      title: 'Delayed delivery of courier parcel',
      description: 'My order shipping shows a delivery delay with the courier parcel.',
    },
    {
      label: 'Account Issue',
      title: 'Unable to update profile username',
      description: 'I am facing an account issue while updating my profile username.',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Columns: Create Ticket Form */}
      <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-6">
        <div className="border-b border-slate-200 pb-4 mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Create & Automatically Classify Support Ticket
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter customer details manually and describe the issue. The Python Rule-Based
            Classifier automatically detects the category and routes the ticket to the right
            support team.
          </p>
        </div>

        {createdResult ? (
          <div className="space-y-5">
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Ticket Created, Classified & Routed Successfully!
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                The ticket has been saved to the relational database and routed to the appropriate
                support team and agent.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                <div className="p-3.5 rounded-lg bg-white border border-emerald-200">
                  <div className="text-xs text-slate-500">Ticket ID</div>
                  <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
                    {createdResult.classification.ticketId}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-white border border-emerald-200">
                  <div className="text-xs text-slate-500">Detected Category</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {createdResult.classification.detectedCategory}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-white border border-emerald-200">
                  <div className="text-xs text-slate-500">Assigned Team</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {createdResult.classification.assignedTeam}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-white border border-emerald-200">
                  <div className="text-xs text-slate-500">Assigned Agent</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {createdResult.classification.assignedAgent}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-white border border-emerald-200">
                  <div className="text-xs text-slate-500">Current Status</div>
                  <div className="text-base font-bold text-indigo-700 mt-0.5">
                    {createdResult.classification.currentStatus}
                  </div>
                </div>
                <div className="p-3.5 rounded-lg bg-white border border-emerald-200">
                  <div className="text-xs text-slate-500">Customer</div>
                  <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
                    {createdResult.ticket.customer_name}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/80 border border-emerald-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Applied Rule:</span>{' '}
                {createdResult.classification.ruleExplanation}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectTicket(createdResult.ticket)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                Inspect Ticket Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onNavigateAllTickets}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Go to All Tickets Table
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Create Another Ticket
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="manual-customer-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Customer Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="manual-customer-name"
                  name="customer_name_manual"
                  type="text"
                  autoComplete="off"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="manual-customer-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Customer Email <span className="text-rose-600">*</span>
                </label>
                <input
                  id="manual-customer-email"
                  name="customer_email_manual"
                  type="email"
                  autoComplete="off"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer email"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="problem-title"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Problem Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="problem-title"
                type="text"
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter problem title"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="problem-description"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Description <span className="text-rose-600">*</span>
                </label>
                <span className="text-xs text-slate-500">
                  Category is auto-detected from description keywords
                </span>
              </div>
              <textarea
                id="problem-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter problem description (e.g., My payment was deducted but my order was not confirmed.)"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white text-slate-900"
              />

              {/* Quick Problem Text Fillers (ONLY fills problem text to test category rules; never touches customer name/email) */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1">Test description rules:</span>
                {sampleProblemTemplates.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => {
                      setTitle(tpl.title);
                      setDescription(tpl.description);
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div>
                <label
                  htmlFor="ticket-priority"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Priority
                </label>
                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white text-slate-900"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Automatic Category Detection Preview Box (Read-Only, Automatic) */}
              <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200">
                <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Auto-Detected Category & Team
                </div>
                {livePreview ? (
                  <div className="mt-1.5 text-xs text-slate-700 space-y-0.5">
                    <div>
                      Detected Category:{' '}
                      <span className="font-bold text-indigo-700">{livePreview.category}</span> ·
                      Team:{' '}
                      <span className="font-semibold text-slate-900">
                        {livePreview.assignedTeam}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Matched Keywords:{' '}
                      {livePreview.matchedKeywords.length > 0
                        ? livePreview.matchedKeywords.join(', ')
                        : 'None (General fallback)'}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1.5 text-xs text-slate-500">
                    Type problem description above to see real-time rule classification.
                  </div>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Classifying & Saving...' : 'Create & Classify Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right Column: Rule-Based Classification Reference Table */}
      <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 h-fit">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Python Rule-Based Classification Logic
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Tickets are classified using deterministic, explainable <strong>IF-THEN</strong> keyword
          rules without manual category selection:
        </p>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">Payment → Payment Support</div>
            <div className="text-slate-500 font-mono mt-1">
              payment, paid, transaction, deducted, payment failed
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">Technical → Technical Support</div>
            <div className="text-slate-500 font-mono mt-1">
              login, password, crash, crashed, error, application not working
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">Refund → Refund Support</div>
            <div className="text-slate-500 font-mono mt-1">
              refund, money back, refund not received
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">Delivery → Delivery Support</div>
            <div className="text-slate-500 font-mono mt-1">
              delivery, shipping, parcel, courier, delayed delivery, delivery delay
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">Account → Account Support</div>
            <div className="text-slate-500 font-mono mt-1">
              account, profile, username, account issue
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900">General → General Support</div>
            <div className="text-slate-500 font-mono mt-1">
              Default fallback if no domain keyword matches
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
