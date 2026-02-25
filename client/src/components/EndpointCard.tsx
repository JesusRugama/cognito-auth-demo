import { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Endpoint, TestResult } from '../types/endpoints';
import { useAuth } from '../contexts/AuthContext';

interface EndpointCardProps {
  endpoint: Endpoint;
}

export function EndpointCard({ endpoint }: EndpointCardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { accessToken } = useAuth();

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'POST':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'PUT':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'DELETE':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const testEndpoint = async () => {
    setLoading(true);
    setResult(null);

    const authHeader = accessToken ? `Bearer ${accessToken}` : '';

    try {
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          status: 'success',
          statusCode: response.status,
          message: 'OK – Action permitted',
          response: data,
          authHeader,
        });
      } else if (response.status === 403) {
        setResult({
          status: 'forbidden',
          statusCode: 403,
          message: `Forbidden — required group: ${endpoint.requiredGroup}`,
          response: data,
          authHeader,
        });
      } else {
        setResult({
          status: 'error',
          statusCode: response.status,
          message: `Error: ${response.statusText}`,
          response: data,
          authHeader,
        });
      }
    } catch (error) {
      setResult({
        status: 'error',
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Network error',
        authHeader,
      });
    }

    setLoading(false);
    setShowDetails(true);
  };

  return (
    <div className="bg-theme-bg-card-alt border border-theme-border rounded-lg p-6 hover:opacity-90 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded text-xs font-bold border ${getMethodColor(
                endpoint.method
              )}`}
            >
              {endpoint.method}
            </span>
            <code className="text-theme-text-secondary text-sm font-mono">{endpoint.path}</code>
          </div>
          <p className="text-theme-text-muted text-sm mb-2">{endpoint.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-text-muted">Required group:</span>
            <span className="text-xs font-mono bg-theme-bg-card px-2 py-1 rounded text-purple-500 border border-theme-border">
              {endpoint.requiredGroup}
            </span>
          </div>
        </div>

        <button
          onClick={testEndpoint}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium text-sm shadow-lg disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Test
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="mt-4 pt-4 border-t border-theme-border">
          <div
            className={`p-4 rounded-lg border-2 ${
              result.status === 'success'
                ? 'bg-green-500/10 border-green-500/50'
                : result.status === 'forbidden'
                ? 'bg-red-500/10 border-red-500/50'
                : 'bg-orange-500/10 border-orange-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : result.status === 'forbidden' ? (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-semibold ${
                      result.status === 'success'
                        ? 'text-green-500'
                        : result.status === 'forbidden'
                        ? 'text-red-500'
                        : 'text-orange-500'
                    }`}
                  >
                    {result.status === 'success'
                      ? 'Allowed'
                      : result.status === 'forbidden'
                      ? 'Access Denied'
                      : `Error ${result.statusCode}`}
                  </span>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-theme-text-muted hover:text-theme-text-secondary flex items-center gap-1"
                  >
                    {showDetails ? (
                      <>
                        Hide details <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Show details <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
                <p
                  className={`text-sm ${
                    result.status === 'success'
                      ? 'text-green-600'
                      : result.status === 'forbidden'
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}
                >
                  {result.message}
                </p>

                {showDetails && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-theme-bg-card rounded p-3 border border-theme-border">
                      <p className="text-xs text-theme-text-muted mb-1 font-semibold">
                        Authorization Header:
                      </p>
                      <code className="text-xs text-theme-text-secondary font-mono break-all">
                        {result.authHeader}
                      </code>
                    </div>
                    {result.response && (
                      <div className="bg-theme-bg-card rounded p-3 border border-theme-border">
                        <p className="text-xs text-theme-text-muted mb-1 font-semibold">
                          Response:
                        </p>
                        <pre className="text-xs text-theme-text-secondary font-mono overflow-x-auto">
                          {JSON.stringify(result.response as object, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
