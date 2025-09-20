import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { CodeExecutionResult } from "@shared/schema";

interface CodeOutputProps {
  result: CodeExecutionResult | null;
  isLoading: boolean;
}

export default function CodeOutput({ result, isLoading }: CodeOutputProps) {
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            Executing Code...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded-md font-mono text-sm text-gray-300">
            Running your code, please wait...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center">
            {result.success ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
            )}
            Execution Result
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {result.executionTime}ms
            </Badge>
            <Badge
              variant={result.success ? "default" : "destructive"}
              className="text-xs"
            >
              Exit Code: {result.exitCode}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Standard Output */}
        {result.stdout && (
          <div>
            <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
              Output:
            </h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded-md font-mono text-sm text-green-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {result.stdout}
            </div>
          </div>
        )}

        {/* Standard Error */}
        {result.stderr && (
          <div>
            <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center">
              <AlertTriangle className="mr-1 h-4 w-4" />
              Error Output:
            </h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded-md font-mono text-sm text-red-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {result.stderr}
            </div>
          </div>
        )}

        {/* Error Message */}
        {result.error && (
          <div>
            <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center">
              <AlertTriangle className="mr-1 h-4 w-4" />
              System Error:
            </h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded-md font-mono text-sm text-orange-300 whitespace-pre-wrap">
              {result.error}
            </div>
          </div>
        )}

        {/* No output message */}
        {!result.stdout && !result.stderr && !result.error && result.success && (
          <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded-md font-mono text-sm text-gray-400">
            Program executed successfully with no output.
          </div>
        )}
      </CardContent>
    </Card>
  );
}