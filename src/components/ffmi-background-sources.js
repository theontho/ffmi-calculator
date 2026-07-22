"use client";

export const renderBackgroundAndSources = () => (
    <section className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded text-sm" aria-labelledby="background-sources-title">
        <h3 className="font-bold text-lg" id="background-sources-title">
            Background and sources
        </h3>
        <div className="mt-3 space-y-3 text-gray-600 dark:text-gray-300">
            <p>This is an educational, heuristic projection. It models slower gains as FFMI rises; it does not predict an individual&apos;s outcome or provide medical, nutrition, or training advice.</p>
            <p>FFMI is calculated from your height, weight, and estimated body fat, so its accuracy is limited by the body-fat estimate. The ranges are contextual reference points, not proof of drug use, health status, or athletic potential.</p>
            <p>
                The muscle projection is grounded in the original{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/7496846/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">FFMI study</a>.
                {' '}Body-fat regions synthesize{' '}
                <a href="http://web.archive.org/web/20220402002602/https://www.acefitness.org/education-and-resources/lifestyle/tools-calculators/percent-body-fat-calculator/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">ACE fitness categories</a>,
                {' '}the lower-fat boundary studied by{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/8002550/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Friedl et al.</a>,
                {' '}and an{' '}
                <a href="https://www.builtlean.com/body-fat-percentage-men-women/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">appearance-oriented practitioner guide</a>.
                {' '}Visible abs and stomach shape vary with fat distribution and muscularity.
            </p>
            <p>
                Fat-loss curves use a dynamic model based on{' '}
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3880593/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Hall et al.</a>
                {' '}and{' '}
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2266991/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Chow and Hall</a>.
                {' '}It applies the{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/10865771/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Forbes fat/lean partition</a>,
                {' '}recalculates expenditure as tissue changes, models two-week adaptive thermogenesis, and includes a bounded first-week fluid/glycogen shift informed by{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/1615908/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">very-low-calorie diet observations</a>.
                {' '}The implementation follows the structure of the{' '}
                <a href="https://www.niddk.nih.gov/bwp" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">NIDDK Body Weight Planner</a>.
            </p>
            <p>
                The maximum daily deficit is the lower of estimated TEE minus a 1,000 kcal/day intake floor and the{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/15615615/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Alpert adipose-energy-transfer ceiling</a>.
                {' '}Initial TEE uses the fat-free-mass power law reported by{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/34385400/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Pontzer et al.</a>
                {' '}The ExFatLoss{' '}
                <a href="https://app.exfatloss.com/adipose" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Max Fat Loss</a>
                {' '}and{' '}
                <a href="https://app.exfatloss.com/tee" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">Total Energy Expenditure</a>
                {' '}pages provide comparison calculators for those two inputs.
            </p>
            <p>
                The advanced 0.75x-1.35x TEE multiplier provides sensitivity around the Pontzer average for individual metabolism and activity. The range comes from an approximate visual fit of the DLW scatter in the{' '}
                <a href="https://www.exfatloss.com/p/introducing-exfatloss-tee-and-macro" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">ExFatLoss TEE methodology</a>,
                {' '}not fixed population percentiles. Exercise is represented through total expenditure rather than added calorie-for-calorie because activity can produce partial expenditure compensation.
            </p>
            <p>
                The fully medically supervised Barbieri-style option sets modeled intake to zero, making the 100% curve a complete-fast scenario. It is calibrated for comparison with the documented 382-day case rather than ordinary dieting; the other speed curves remain fractions of that zero-intake maximum.
            </p>
            <p>
                The 60-75% body-fat regions are extrapolated casual visual descriptors, not directly measured population norms. The 75% ceiling reflects evidence that excess weight retains a substantial lean component in{' '}
                <a href="https://pubmed.ncbi.nlm.nih.gov/6469707/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">body-composition studies</a>;
                {' '}at exceptional weights, muscle, organs, skin, connective tissue, blood volume, and extracellular water all add fat-free mass.
            </p>
            <p>
                As a historical comparison, the medically monitored{' '}
                <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2495396/" target="_blank" className="text-blue-500 hover:text-blue-700 underline" rel="noopener">382-day Angus Barbieri fast</a>
                {' '}reduced scale weight from 456 to 180 lb, averaging about 5.1 lb/week. That observed scale rate included changing fat, lean tissue, glycogen, water, sodium, and gut contents rather than fat alone.
            </p>
        </div>
    </section>
);
