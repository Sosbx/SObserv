import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { AlertTriangle, Stethoscope, Star } from 'lucide-react';
import EchoExam from '../components/echo/EchoExam';
import EchoReport from '../components/echo/EchoReport';
import EchoFavorites from '../components/echo/EchoFavorites';
import { useEchoStore } from '../store/echoStore';

function EchoPage() {
  const { report, updateReport } = useEchoStore();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabSelect = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
          <p className="text-sm text-amber-700">
            Cette fonctionnalité est actuellement en cours de développement. Certaines options peuvent ne pas être disponibles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-6">
              Compte rendu d'échographie
            </h1>
            
            <Tabs className="space-y-6" onSelect={handleTabSelect}>
              <TabList className="flex">
                <Tab className="flex-1 px-6 py-3 text-base font-medium text-gray-500 hover:text-gray-700 cursor-pointer ui-selected:text-indigo-600 ui-selected:border-indigo-600 transition-all duration-200 border-2 border-b-0 rounded-t-lg mr-1 bg-gray-50 ui-selected:bg-white ui-selected:shadow-[2px_-2px_5px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center justify-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Examen
                  </div>
                </Tab>
                <Tab className="flex-1 px-6 py-3 text-base font-medium text-gray-500 hover:text-gray-700 cursor-pointer ui-selected:text-indigo-600 ui-selected:border-indigo-600 transition-all duration-200 border-2 border-b-0 rounded-t-lg bg-gray-50 ui-selected:bg-white ui-selected:shadow-[2px_-2px_5px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-5 w-5" />
                    Favoris
                  </div>
                </Tab>
              </TabList>

              <div className="bg-white pt-6">
                <TabPanel>
                  <EchoExam />
                </TabPanel>

                <TabPanel>
                  <EchoFavorites onReportChange={updateReport} />
                </TabPanel>
              </div>
            </Tabs>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <EchoReport />
        </div>
      </div>
    </>
  );
}

export default EchoPage;