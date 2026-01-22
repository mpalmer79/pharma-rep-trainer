interface TrainingJourneyProps {
  journey: TrainingJourney;

  onNodeSelect: (node: TrainingJourneyNode) => void;

  showProgress?: boolean;
  showEstimatedTime?: boolean;

  orientation?: "vertical" | "horizontal";
}
