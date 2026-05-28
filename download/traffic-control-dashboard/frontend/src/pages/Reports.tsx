import {
  Download, FileText, FileSpreadsheet, Brain, BarChart3,
} from 'lucide-react';

export default function Reports() {
  const reports = [
    {
      title: 'Download CSV Data',
      description: 'Complete traffic violation dataset with all fields and records',
      icon: FileSpreadsheet,
      color: '#66B800',
      bgColor: 'bg-[#66B800]/10',
      action: 'Download CSV',
    },
    {
      title: 'Association Rules Report',
      description: 'Apriori algorithm results with support, confidence, and lift metrics',
      icon: Brain,
      color: '#3B82F6',
      bgColor: 'bg-blue-50',
      action: 'Download Rules',
    },
    {
      title: 'Cluster Analysis Report',
      description: 'K-Means clustering results with risk zone classification',
      icon: BarChart3,
      color: '#F59E0B',
      bgColor: 'bg-yellow-50',
      action: 'Download Clusters',
    },
    {
      title: 'Summary Report',
      description: 'Complete DWDM project report with methodology and findings',
      icon: FileText,
      color: '#8B5CF6',
      bgColor: 'bg-purple-50',
      action: 'Download Report',
    },
  ];

  const reportSections = [
    { title: '1. Introduction', content: 'Overview of traffic control intelligence system, objectives, and scope of the DWDM project.' },
    { title: '2. Data Collection & Preprocessing', content: 'Traffic violation data from Indian cities, data cleaning, feature engineering, and transformation steps.' },
    { title: '3. Exploratory Data Analysis', content: 'Statistical analysis, violation distributions, temporal patterns, and geographical insights.' },
    { title: '4. Association Rule Mining', content: 'Apriori algorithm implementation, rule generation, and interpretation of traffic violation patterns.' },
    { title: '5. Clustering Analysis', content: 'K-Means clustering for risk zone classification, cluster validation, and Silhouette analysis.' },
    { title: '6. Risk Prediction', content: 'Risk score calculation, zone classification, and prediction model evaluation.' },
    { title: '7. Dashboard & Visualization', content: 'Interactive dashboard design, real-time monitoring, and map-based visualization.' },
    { title: '8. Conclusion & Recommendations', content: 'Key findings, actionable insights, and future scope for traffic management improvement.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reports & Downloads</h2>
        <p className="text-sm text-gray-500">Download analysis results and project reports</p>
      </div>

      {/* Download Cards */}
      <div className="grid grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${report.bgColor} flex items-center justify-center flex-shrink-0`}>
                <report.icon className="w-6 h-6" style={{ color: report.color }} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">{report.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                <button className="mt-3 flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#66B800] text-white rounded-lg hover:bg-[#5ca300] transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  {report.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[#66B800]" />
          <h3 className="text-sm font-bold text-gray-900">DWDM Project Report — Content Preview</h3>
        </div>
        <div className="space-y-3">
          {reportSections.map((section) => (
            <div key={section.title} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-bold text-gray-800 mb-1">{section.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
