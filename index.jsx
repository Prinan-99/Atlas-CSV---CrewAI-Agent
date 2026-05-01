import React, { useEffect, useMemo, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 5000;
const MAX_STATUS_CHECKS = 120;
const WEBSITE_URL_PLACEHOLDER = 'Enter a website URL, for example https://example.com';
const ASSET_BASE_URL = import.meta.env.BASE_URL || '/';
const TUTORIAL_VIDEO_URL = `${ASSET_BASE_URL}assets/tutorial-how-it-works.mp4`;
const TUTORIAL_POSTER_URL = `${ASSET_BASE_URL}assets/data-story-hero.png`;
const CREATOR_NAME = 'Pria Nandhini M A';
const CREATOR_LINKS = {
  linkedin: 'https://www.linkedin.com/in/prianandhinii',
  github: 'https://github.com/Prinan-99',
  portfolio: 'https://prianandhini.tech/'
};
const RUN_STAGES = [
  {
    id: 'prepare',
    title: 'Prepare request',
    description: 'Checking the website URL'
  },
  {
    id: 'kickoff',
    title: 'Start AI agent',
    description: 'Sending the job to CrewAI'
  },
  {
    id: 'poll',
    title: 'Agent working',
    description: 'Collecting and cleaning website data'
  },
  {
    id: 'csv',
    title: 'Build CSV',
    description: 'Formatting rows and columns'
  },
  {
    id: 'done',
    title: 'Ready',
    description: 'Preview and download the CSV file'
  }
];
const STAGE_ORDER = RUN_STAGES.map((stage) => stage.id);
const TRUST_POINTS = [
  'Private API key stays server-side in the Vite proxy',
  'Live run progress instead of a blank waiting screen',
  'CSV table preview before download'
];
const TUTORIAL_STEPS = [
  ['01', 'Enter a URL', 'Paste any public website link into the console input.'],
  ['02', 'Run extraction', 'The app sends the job to the CrewAI workflow and shows progress.'],
  ['03', 'Download CSV', 'Preview the structured rows and save the final CSV file.']
];
const CREW_FLOW = [
  {
    title: 'Trigger',
    type: 'Entry point',
    copy: 'The web app sends a kickoff event with the user supplied website_url.',
    position: 'lg:col-start-1 lg:row-start-2'
  },
  {
    title: 'Universal Web Data Scraper',
    type: 'Agent',
    copy: 'A GPT-4o mini agent opens the website and reads the page content using browsing tools.',
    position: 'lg:col-start-2 lg:row-start-1'
  },
  {
    title: 'Extract Website Data',
    type: 'Task',
    copy: 'The scraper task pulls structured fields from the target page and produces raw extracted data.',
    position: 'lg:col-start-2 lg:row-start-3'
  },
  {
    title: 'Data Cleaning and CSV Formatter',
    type: 'Agent',
    copy: 'A second GPT-4o mini agent receives the raw data and standardizes it for spreadsheet use.',
    position: 'lg:col-start-3 lg:row-start-1'
  },
  {
    title: 'Generate Clean CSV File',
    type: 'Task',
    copy: 'The final task converts the cleaned extraction into CSV output that the app can preview and download.',
    position: 'lg:col-start-3 lg:row-start-3'
  }
];

function SocialIconLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white/78 transition hover:-translate-y-0.5 hover:border-[#f0b84f] hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.94 8.98H3.75V20h3.19V8.98ZM7.2 5.58c0-.96-.74-1.7-1.85-1.7-1.1 0-1.85.74-1.85 1.7 0 .94.72 1.7 1.81 1.7h.02c1.13 0 1.87-.76 1.87-1.7ZM20.5 13.68c0-3.33-1.78-4.88-4.16-4.88-1.92 0-2.78 1.05-3.26 1.79V8.98H9.9c.04 1.03 0 11.02 0 11.02h3.18v-6.15c0-.33.02-.66.12-.89.26-.66.86-1.34 1.86-1.34 1.31 0 1.84 1.01 1.84 2.49V20h3.18l.42-6.32Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.49.09.67-.21.67-.47v-1.73c-2.72.59-3.3-1.17-3.3-1.17-.45-1.13-1.09-1.43-1.09-1.43-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.88 1.5 2.3 1.07 2.86.82.09-.64.34-1.07.62-1.31-2.17-.25-4.46-1.09-4.46-4.84 0-1.07.38-1.94 1-2.63-.1-.25-.44-1.25.1-2.6 0 0 .83-.27 2.7 1a9.28 9.28 0 0 1 4.92 0c1.88-1.27 2.7-1 2.7-1 .54 1.35.2 2.35.1 2.6.63.69 1 1.56 1 2.63 0 3.76-2.29 4.59-4.47 4.83.35.3.67.9.67 1.82v2.6c0 .26.18.57.68.47A9.8 9.8 0 0 0 12 2.2Z" />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
      <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <path d="M4 13h16" />
      <path d="M10 13v1h4v-1" />
    </svg>
  );
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeWebsiteUrl(value) {
  const trimmed = value.trim().replace(/\s+/g, '-');

  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function extractText(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return (
      value.raw ||
      value.output ||
      value.result ||
      value.final_output ||
      value.content ||
      ''
    );
  }

  return '';
}

function extractCsvFromText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const csvFenceMatch = text.match(/```csv\s*([\s\S]*?)```/i);

  if (csvFenceMatch?.[1]) {
    return csvFenceMatch[1].trim();
  }

  return text.trim();
}

function parseCsvRows(csvText) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }

      row.push(field);

      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }

      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);

  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function extractCsvContent(data) {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const taskResults = Array.isArray(data.tasks)
    ? data.tasks
    : Array.isArray(data.task_outputs)
      ? data.task_outputs
      : [];

  if (taskResults.length > 0) {
    const csvTask =
      taskResults.find((task) => {
        const searchable = [
          task.name,
          task.description,
          task.agent_role,
          task.agent,
          task.task_name
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchable.includes('csv') || searchable.includes('formatter');
      }) || taskResults[taskResults.length - 1];

    const taskCsv = extractCsvFromText(extractText(csvTask));

    if (taskCsv) {
      return taskCsv;
    }
  }

  const topLevelOutput = [
    data.result,
    data.final_output,
    data.output,
    data.raw,
    data.response
  ]
    .map(extractText)
    .find(Boolean);

  return extractCsvFromText(topLevelOutput);
}

async function readJsonResponse(response, label) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const detail =
      data?.detail ||
      data?.message ||
      data?.error ||
      text ||
      response.statusText;

    throw new Error(`${label} failed (${response.status}): ${detail}`);
  }

  return data || {};
}

function getStageState(stageId, activeStage, failed) {
  if (failed) {
    return stageId === activeStage ? 'error' : 'idle';
  }

  const stageIndex = STAGE_ORDER.indexOf(stageId);
  const activeIndex = STAGE_ORDER.indexOf(activeStage);

  if (activeIndex === -1) {
    return 'idle';
  }

  if (stageIndex < activeIndex) {
    return 'complete';
  }

  if (stageIndex === activeIndex) {
    return activeStage === 'done' ? 'complete' : 'active';
  }

  return 'idle';
}

async function pollKickoffStatus(kickoffId, updateStatusMessage) {
  for (let attempt = 1; attempt <= MAX_STATUS_CHECKS; attempt += 1) {
    updateStatusMessage(`Checking run status ${attempt}/${MAX_STATUS_CHECKS}`);

    const response = await fetch(`/api/status/${encodeURIComponent(kickoffId)}`, {
      headers: {
        Accept: 'application/json'
      }
    });
    const statusData = await readJsonResponse(response, 'Status request');
    const status = String(statusData.state || statusData.status || '').toLowerCase();

    if (status) {
      updateStatusMessage(`CrewAI state: ${status}`);
    }

    if (['completed', 'complete', 'success', 'succeeded', 'done'].includes(status)) {
      return statusData;
    }

    if (['failed', 'failure', 'error', 'cancelled', 'canceled'].includes(status)) {
      throw new Error(`Automation failed: ${JSON.stringify(statusData)}`);
    }

    if (!status && extractCsvContent(statusData)) {
      return statusData;
    }

    if (attempt < MAX_STATUS_CHECKS) {
      await sleep(POLL_INTERVAL_MS);
    }
  }

  throw new Error(
    'The AI run is still pending after 10 minutes. Try the exact page URL again, or use a smaller page/filter if the site is very large.'
  );
}

const WebToCsvExtractor = () => {
  const tutorialVideoRef = useRef(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [error, setError] = useState('');
  const [activeStage, setActiveStage] = useState('prepare');
  const [statusMessage, setStatusMessage] = useState('Ready to extract a website.');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [tutorialEnded, setTutorialEnded] = useState(false);

  const canSubmit = useMemo(
    () => normalizeWebsiteUrl(websiteUrl).length > 0 && !loading,
    [loading, websiteUrl]
  );
  const cleanCsvData = useMemo(() => extractCsvFromText(csvData) || csvData, [csvData]);
  const csvRows = useMemo(() => parseCsvRows(cleanCsvData), [cleanCsvData]);
  const csvHeaders = csvRows[0] || [];
  const csvPreviewRows = csvRows.slice(1);
  const csvColumnCount = Math.max(...csvRows.map((row) => row.length), 0);

  const runAutomation = async () => {
    const normalizedUrl = normalizeWebsiteUrl(websiteUrl);

    if (!normalizedUrl) {
      setError('Please enter a website URL.');
      return;
    }

    setLoading(true);
    setError('');
    setCsvData('');
    setHasStarted(true);
    setActiveStage('prepare');
    setWebsiteUrl(normalizedUrl);
    setStatusMessage(`Preparing ${normalizedUrl}`);

    try {
      setActiveStage('kickoff');
      setStatusMessage('Starting the CrewAI agent');

      const response = await fetch('/api/kickoff', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            website_url: normalizedUrl,
            raw_data: normalizedUrl
          },
          meta: {
            source: 'web-to-csv-extractor'
          }
        })
      });

      let data = await readJsonResponse(response, 'Kickoff request');

      if (data.kickoff_id || data.task_id || data.id) {
        const kickoffId = data.kickoff_id || data.task_id || data.id;
        setActiveStage('poll');
        setStatusMessage(`Agent run accepted: ${kickoffId}`);
        data = await pollKickoffStatus(kickoffId, setStatusMessage);
      } else {
        setStatusMessage('Agent returned a result directly');
      }

      setActiveStage('csv');
      setStatusMessage('Formatting CSV output');
      let csvContent = extractCsvContent(data);

      if (!csvContent) {
        csvContent = JSON.stringify(data, null, 2);
        setStatusMessage('No CSV field was found, showing the raw response');
      } else {
        setStatusMessage('CSV output found');
      }

      setCsvData(csvContent);
      setActiveStage('done');
      setStatusMessage('CSV is ready to preview and download');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStatusMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    const blob = new Blob([cleanCsvData], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'extracted_data.csv';
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const openConsole = () => {
    setCurrentPage('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLanding = () => {
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentPage !== 'landing') {
      return undefined;
    }

    const revealElements = Array.from(document.querySelectorAll('.scroll-reveal'));

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.18
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [currentPage]);

  if (currentPage === 'console') {
    return (
      <div className="min-h-screen bg-[#eef3f1] px-5 py-8 text-[#101614] md:px-8">
        <header className="mx-auto mb-10 flex max-w-7xl items-center justify-between">
          <button
            type="button"
            onClick={openLanding}
            className="text-sm font-semibold text-[#1f6f64] hover:text-[#101614]"
          >
            Atlas CSV
          </button>
          <button
            type="button"
            onClick={openLanding}
            className="rounded-md border border-[#bdccc7] bg-white px-4 py-2 text-sm font-semibold hover:border-[#1f6f64]"
          >
            Back to story
          </button>
        </header>

        <main className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6f64]">
                Agent console
              </p>
              <h1 className="mt-3 text-5xl font-semibold leading-tight">Extract a CSV now.</h1>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#53645f]">
              Paste any public page you want to convert. The app keeps the API key
              behind the local proxy while the browser shows progress.
            </p>
          </div>

          <div className="rounded-md border border-[#ccd8d4] bg-[#f8fbfa] p-5 shadow-xl shadow-black/5 md:p-6">
              <section className="mb-6">
                <label className="mb-2 block text-sm font-semibold" htmlFor="websiteUrl">
                  Website URL
                </label>
                <div className="flex flex-col gap-3 lg:flex-row">
                  <input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && canSubmit) {
                        runAutomation();
                      }
                    }}
                    placeholder={WEBSITE_URL_PLACEHOLDER}
                    className="min-w-0 flex-1 rounded-md border border-[#bdccc7] bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#f0b84f]"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={runAutomation}
                    disabled={!canSubmit}
                    className="rounded-md bg-[#101614] px-6 py-3 text-sm font-bold text-white hover:bg-[#18302b] disabled:bg-[#9aa8a4]"
                  >
                    {loading ? 'Processing...' : 'Extract Data'}
                  </button>
                </div>
              </section>

              {loading && (
                <div className="mb-6 rounded-md border border-[#b9d6ff] bg-[#eef6ff] p-4 text-[#153d66]">
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-[#153d66]" />
                    <span>Extracting data from the website. Larger databases can take several minutes.</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-md border border-[#f4c7c7] bg-[#fff1f1] p-4 text-[#b31313]">
                  <strong>Failed to extract data:</strong> {error}
                </div>
              )}

              <section className="rounded-md border border-[#d8e2df] bg-white p-4">
                <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                  <div>
                    <h2 className="font-semibold">Progress</h2>
                    <p className="text-sm text-[#53645f]">{statusMessage}</p>
                  </div>
                  {loading && (
                    <span className="text-sm font-semibold text-[#1558a8]">Running</span>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-5">
                  {RUN_STAGES.map((stage) => {
                    const state = getStageState(stage.id, activeStage, Boolean(error));
                    const isActive = state === 'active';
                    const isComplete = state === 'complete';
                    const isError = state === 'error';

                    return (
                      <div
                        key={stage.id}
                        className={[
                          'rounded-md border bg-white p-3 transition',
                          isActive ? 'border-[#1558a8] shadow-sm ring-2 ring-[#dbeafe]' : '',
                          isComplete ? 'border-[#18864b]' : '',
                          isError ? 'border-[#e13131] bg-[#fff6f6]' : '',
                          state === 'idle' ? 'border-[#d8e2df] opacity-70' : ''
                        ].join(' ')}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={[
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                              isActive ? 'bg-[#1558a8] text-white' : '',
                              isComplete ? 'bg-[#18864b] text-white' : '',
                              isError ? 'bg-[#e13131] text-white' : '',
                              state === 'idle' ? 'bg-[#e0e8e5] text-[#64756f]' : ''
                            ].join(' ')}
                          >
                            {isActive && (
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            )}
                            {isComplete && '✓'}
                            {isError && '!'}
                            {state === 'idle' && STAGE_ORDER.indexOf(stage.id) + 1}
                          </span>
                          <h3 className="text-sm font-semibold text-[#101614]">{stage.title}</h3>
                        </div>
                        <p className="text-xs leading-5 text-[#53645f]">{stage.description}</p>
                        {isActive && (
                          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#dbeafe]">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#1558a8]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!hasStarted && (
                  <p className="mt-3 text-sm text-[#64756f]">
                    Enter a website and start extraction to see each step animate.
                  </p>
                )}
              </section>
            </div>

          <section className="py-12">
            {csvData ? (
              <section className="rounded-md border border-[#ccd8d4] bg-white p-5 shadow-xl shadow-black/5 md:p-6">
                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6f64]">
                      Output
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold">CSV Preview</h2>
                    <p className="text-sm text-[#53645f]">
                      {Math.max(csvRows.length - 1, 0)} rows, {csvColumnCount} columns
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCsv}
                    className="rounded-md bg-[#18864b] px-4 py-3 text-sm font-bold text-white hover:bg-[#106c3a]"
                  >
                    Download CSV
                  </button>
                </div>
                {csvRows.length > 0 ? (
                  <div className="mb-4 max-h-96 overflow-auto rounded-md border border-[#cbd8d4]">
                    <table className="min-w-full border-collapse bg-white text-left text-sm">
                      <thead className="sticky top-0 bg-[#eaf1ef]">
                        <tr>
                          {Array.from({ length: csvColumnCount }).map((_, columnIndex) => (
                            <th
                              key={`header-${columnIndex}`}
                              className="whitespace-nowrap border-b border-r border-[#cbd8d4] px-3 py-2 font-semibold text-[#101614]"
                            >
                              {csvHeaders[columnIndex] || `Column ${columnIndex + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreviewRows.map((row, rowIndex) => (
                          <tr key={`row-${rowIndex}`} className="odd:bg-white even:bg-[#f8fbfa]">
                            {Array.from({ length: csvColumnCount }).map((_, columnIndex) => (
                              <td
                                key={`cell-${rowIndex}-${columnIndex}`}
                                className="max-w-xs border-b border-r border-[#dde8e4] px-3 py-2 align-top text-[#3e504a]"
                              >
                                <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                                  {row[columnIndex] || ''}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mb-4 rounded-md border border-[#cbd8d4] bg-[#f8fbfa] p-4 text-sm text-[#53645f]">
                    No CSV rows were found.
                  </div>
                )}
                <details>
                  <summary className="cursor-pointer text-sm font-semibold text-[#3e504a]">
                    View raw CSV text
                  </summary>
                  <textarea
                    value={cleanCsvData}
                    readOnly
                    rows={10}
                    className="mt-2 w-full rounded-md border border-[#cbd8d4] bg-[#f8fbfa] p-3 font-mono text-sm"
                  />
                </details>
              </section>
            ) : (
              <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6f64]">
                    Preview
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold">Your CSV appears here.</h2>
                  <p className="mt-4 max-w-xl leading-7 text-[#53645f]">
                    Once the agent finishes, this section becomes a spreadsheet-style
                    preview with a download button for the final file.
                  </p>
                </div>
                <div className="rounded-md border border-[#ccd8d4] bg-white p-5 shadow-xl shadow-black/5">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {['Name', 'Source', 'Value', 'Item A', 'Page 1', 'Ready', 'Item B', 'Page 2', 'Clean'].map((cell) => (
                      <div key={cell} className="rounded border border-[#dce7e3] bg-[#f8fbfa] px-3 py-2 text-[#53645f]">
                        {cell}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef3f1] text-[#101614]">
      <style>
        {`
          .scroll-reveal {
            opacity: 0;
            transform: translateY(28px);
            transition: opacity 700ms ease, transform 700ms ease;
            transition-delay: var(--reveal-delay, 0ms);
          }

          .scroll-reveal.is-visible {
            opacity: 1;
            transform: translateY(0);
          }

          @media (prefers-reduced-motion: reduce) {
            .scroll-reveal {
              opacity: 1;
              transform: none;
              transition: none;
            }
          }
        `}
      </style>
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-[#0f1f1c]/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white md:px-8">
          <a href="#top" className="text-base font-semibold tracking-wide">
            Atlas CSV
          </a>
          <div className="hidden items-center gap-7 text-sm text-white/75 md:flex">
            <a href="#benefits" className="hover:text-white">Benefits</a>
            <a href="#tutorial" className="hover:text-white">Tutorial</a>
            <a href="#implementation" className="hover:text-white">Implementation</a>
            <a href="#crew-flow" className="hover:text-white">CrewAI flow</a>
          </div>
          <button
            type="button"
            onClick={openConsole}
            className="rounded-md bg-[#f0b84f] px-4 py-2 text-sm font-bold text-[#101614] hover:bg-[#ffd078]"
          >
            Open console
          </button>
        </nav>
      </header>

      <main id="top">
        <section
          className="relative flex min-h-screen items-end overflow-hidden bg-[#0f1f1c]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(10, 20, 18, 0.96) 0%, rgba(10, 20, 18, 0.84) 40%, rgba(10, 20, 18, 0.32) 78%), url("/assets/data-story-hero.png")',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-32 md:px-8 md:pb-16">
            <div className="scroll-reveal max-w-4xl text-white">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#f0b84f]">
                AI web extraction, explained beautifully
              </p>
              <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
                Watch a website become structured data.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
               Transform any website into downloadable CSV data instantly. 
               Just enter a URL and watch messy web content become clean, structured spreadsheet data ready for analysis.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openConsole}
                  className="rounded-md bg-[#f0b84f] px-5 py-3 text-sm font-bold text-[#101614] hover:bg-[#ffd078]"
                >
                  Go to agent console
                </button>
                <a
                  href="#benefits"
                  className="rounded-md border border-white/25 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
                >
                  Scroll the story
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="crew-flow" className="bg-[#0f1f1c] px-5 py-24 text-white md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="scroll-reveal mb-12 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f0b84f]">
                  Priority flow
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                  This is the CrewAI automation that powers the product.
                </h2>
              </div>
              <p className="leading-7 text-white/72">
                A trigger starts the crew, the scraper agent reads the website, one task
                extracts structured raw data, and the formatter agent turns it into a
                clean downloadable CSV. The animation follows that exact handoff.
              </p>
            </div>

            <div className="scroll-reveal relative overflow-hidden rounded-md border border-white/10 bg-[#122824] p-5 shadow-2xl shadow-black/30 md:p-8">
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:22px_22px]" />
              <div className="pointer-events-none absolute left-[22%] top-[50%] hidden h-px w-[17%] bg-[#f0b84f]/70 lg:block">
                <span className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 animate-ping rounded-full bg-[#f0b84f]" />
              </div>
              <div className="pointer-events-none absolute left-[47%] top-[33%] hidden h-px w-[18%] bg-[#f0b84f]/70 lg:block">
                <span className="absolute left-1/3 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#f0b84f]" />
              </div>
              <div className="pointer-events-none absolute left-[47%] top-[68%] hidden h-px w-[18%] bg-[#f0b84f]/70 lg:block">
                <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-y-1/2 animate-ping rounded-full bg-[#f0b84f]" />
              </div>
              <div className="relative grid gap-4 lg:grid-cols-3 lg:grid-rows-[1fr_0.32fr_1fr]">
                {CREW_FLOW.map((node, index) => (
                  <article
                    key={node.title}
                    style={{ '--reveal-delay': `${index * 90}ms` }}
                    className={[
                      'scroll-reveal rounded-md border border-white/15 bg-white p-5 text-[#101614] shadow-2xl shadow-black/20 transition duration-500 hover:-translate-y-1 hover:shadow-[#f0b84f]/20',
                      node.position,
                      node.type === 'Agent' ? 'ring-2 ring-[#8fc9ff]/70' : '',
                      index === 0 ? 'animate-pulse' : ''
                    ].join(' ')}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1f6f64]">
                        {node.type}
                      </p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3f1] text-xs font-bold text-[#1f6f64]">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold leading-6">{node.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-[#53645f]">{node.copy}</p>
                    {node.type === 'Agent' && (
                      <p className="mt-4 rounded border border-[#dce7e3] bg-[#f8fbfa] px-3 py-2 text-xs font-semibold text-[#3e504a]">
                        Model: GPT-4o mini
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="scroll-reveal rounded-md border border-white/10 bg-white/10 p-5">
                <p className="text-sm font-semibold text-[#f0b84f]">Input</p>
                <p className="mt-2 text-sm leading-6 text-white/74">
                  The app passes <span className="font-mono text-white">website_url</span> and raw source context into kickoff.
                </p>
              </div>
              <div className="scroll-reveal rounded-md border border-white/10 bg-white/10 p-5 [--reveal-delay:90ms]">
                <p className="text-sm font-semibold text-[#f0b84f]">Processing</p>
                <p className="mt-2 text-sm leading-6 text-white/74">
                  CrewAI runs scraper and formatter responsibilities separately, which keeps extraction and cleanup clear.
                </p>
              </div>
              <div className="scroll-reveal rounded-md border border-white/10 bg-white/10 p-5 [--reveal-delay:180ms]">
                <p className="text-sm font-semibold text-[#f0b84f]">Output</p>
                <p className="mt-2 text-sm leading-6 text-white/74">
                  The final task returns CSV text, then the React app parses it into a table and saves it as a file.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="tutorial" className="px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="scroll-reveal mb-10 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6f64]">
                  Tutorial video
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                  See the complete extraction flow in motion.
                </h2>
              </div>
              <p className="leading-7 text-[#53645f]">
                A quick visual walkthrough shows how a website URL moves through the
                extractor, becomes structured data, and ends as a downloadable CSV.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-stretch">
              <div className="scroll-reveal overflow-hidden rounded-md border border-[#bdccc7] bg-[#101614] p-3 shadow-2xl shadow-black/10">
                <div className="relative overflow-hidden rounded bg-black">
                  <video
                    ref={tutorialVideoRef}
                    className="aspect-video w-full bg-black object-contain"
                    autoPlay
                    muted
                    playsInline
                    poster={TUTORIAL_POSTER_URL}
                    preload="auto"
                    onCanPlay={(event) => {
                      event.currentTarget.defaultPlaybackRate = 7;
                      event.currentTarget.playbackRate = 7;
                      event.currentTarget.play().catch(() => {});
                    }}
                    onLoadedMetadata={(event) => {
                      event.currentTarget.defaultPlaybackRate = 7;
                      event.currentTarget.playbackRate = 7;
                    }}
                    onPlay={() => setTutorialEnded(false)}
                    onEnded={() => setTutorialEnded(true)}
                  >
                    <source src={TUTORIAL_VIDEO_URL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="pointer-events-none absolute left-3 top-3 rounded bg-[#101614]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f0b84f] backdrop-blur">
                    Auto walkthrough
                  </div>
                  {tutorialEnded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#101614]/82 p-5 text-white backdrop-blur-sm">
                      <div className="max-w-sm text-center">
                        <p className="text-lg font-semibold">Replay the walkthrough?</p>
                        <p className="mt-2 text-sm leading-6 text-white/70">
                          Watch the extraction flow again from the beginning.
                        </p>
                        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => {
                              const video = tutorialVideoRef.current;

                              if (video) {
                                video.currentTime = 0;
                                video.defaultPlaybackRate = 7;
                                video.playbackRate = 7;
                                video.play().catch(() => {});
                              }

                              setTutorialEnded(false);
                            }}
                            className="rounded-md bg-[#f0b84f] px-4 py-2 text-sm font-bold text-[#101614] hover:bg-[#ffd078]"
                          >
                            Replay
                          </button>
                          <button
                            type="button"
                            onClick={() => setTutorialEnded(false)}
                            className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                          >
                            No thanks
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 px-2 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold">Follow the path from URL to finished CSV.</p>
                  <button
                    type="button"
                    onClick={openConsole}
                    className="w-fit rounded-md bg-[#f0b84f] px-4 py-2 text-sm font-bold text-[#101614] hover:bg-[#ffd078]"
                  >
                    Try it now
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {TUTORIAL_STEPS.map(([step, title, copy], index) => (
                  <article
                    key={title}
                    style={{ '--reveal-delay': `${index * 90}ms` }}
                    className="scroll-reveal rounded-md border border-[#ccd8d4] bg-white p-5 shadow-xl shadow-black/5"
                  >
                    <p className="text-sm font-bold text-[#1f6f64]">{step}</p>
                    <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#53645f]">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="px-5 py-20 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="scroll-reveal mb-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6f64]">
                Benefits
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                Built for people who need usable data, not another wall of scraped text.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['Clean output', 'Transforms noisy web content into rows and columns that can move straight into spreadsheets.'],
                ['Visible progress', 'Shows each step of the AI run so users understand what is happening while the agent works.'],
                ['Safer credentials', 'Uses a local proxy pattern so API keys stay outside the browser interface.']
              ].map(([title, copy], index) => (
                <article
                  key={title}
                  style={{ '--reveal-delay': `${index * 90}ms` }}
                  className="scroll-reveal rounded-md border border-[#ccd8d4] bg-white p-6 shadow-xl shadow-black/5"
                >
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-4 leading-7 text-[#53645f]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="implementation" className="bg-white px-5 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div className="scroll-reveal">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1f6f64]">
                Implementation
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">
                A clear handoff from browser to CrewAI to CSV.
              </h2>
              <p className="mt-5 leading-7 text-[#53645f]">
                The interface sends a kickoff request through the Vite proxy, polls the
                CrewAI status endpoint, extracts the final CSV content, parses it into a
                preview table, and lets the user download the file.
              </p>
            </div>
            <div className="scroll-reveal rounded-md border border-[#ccd8d4] bg-[#f8fbfa] p-5 [--reveal-delay:120ms]">
              {['React landing page', 'Vite API proxy', 'CrewAI kickoff', 'Status polling', 'CSV parser', 'Download file'].map((item, index) => (
                <div key={item} className="flex items-center gap-4 border-b border-[#dce7e3] py-4 last:border-b-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f6f64] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        
      </main>

      <footer className="scroll-reveal border-t border-[#d0ddd9] bg-[#101614] px-5 py-10 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div>
              <a href="#top" className="text-lg font-semibold tracking-wide">
                Atlas CSV
              </a>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/62">
                Turn public website data into clean CSV files with a guided CrewAI workflow.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-white">Explore</p>
                <div className="mt-4 flex flex-col gap-3 text-sm text-white/68">
                  <a href="#crew-flow" className="hover:text-white">CrewAI flow</a>
                  <a href="#tutorial" className="hover:text-white">Tutorial</a>
                  <a href="#benefits" className="hover:text-white">Benefits</a>
                  <a href="#implementation" className="hover:text-white">Implementation</a>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white">Creator</p>
                <a
                  href={CREATOR_LINKS.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-[#f0b84f] hover:text-[#ffd078]"
                >
                  {CREATOR_NAME}
                </a>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SocialIconLink href={CREATOR_LINKS.linkedin} label="LinkedIn">
                    <LinkedInIcon />
                  </SocialIconLink>
                  <SocialIconLink href={CREATOR_LINKS.github} label="GitHub">
                    <GitHubIcon />
                  </SocialIconLink>
                  <SocialIconLink href={CREATOR_LINKS.portfolio} label="Portfolio">
                    <PortfolioIcon />
                  </SocialIconLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebToCsvExtractor;
