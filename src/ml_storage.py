#!/usr/bin/env python3
"""ML Predictions Storage - Handles storing ML predictions to Supabase"""
import logging
from typing import Dict, Optional
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

class MLPredictionStorage:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        logger.info("✅ ML Prediction Storage initialized")
    
    def store_prediction(self, vehicle_id: int, sensor_data_id: Optional[int], prediction_result: Dict) -> bool:
        try:
            prediction_data = {
                'vehicle_id': vehicle_id,
                'sensor_data_id': sensor_data_id,
                'timestamp': prediction_result.get('timestamp', datetime.now(timezone.utc).isoformat()),
                'predicted_health_status': prediction_result['predicted_health_status'],
                'predicted_status': prediction_result['predicted_status'],
                'confidence_score': prediction_result['confidence_score'],
                'prob_normal': prediction_result['probabilities']['normal'],
                'prob_advisory': prediction_result['probabilities']['advisory'],
                'prob_warning': prediction_result['probabilities'].get('warning', 0.0),
                'prob_critical': prediction_result['probabilities']['critical'],
                'predicted_failure_risk': prediction_result.get('failure_risk'),
                'days_until_maintenance': prediction_result.get('days_until_maintenance'),
                'recommended_actions': prediction_result.get('recommended_actions', []),
                'top_risk_factor_1': prediction_result['top_risk_factors'][0] if len(prediction_result.get('top_risk_factors', [])) > 0 else None,
                'top_risk_factor_2': prediction_result['top_risk_factors'][1] if len(prediction_result.get('top_risk_factors', [])) > 1 else None,
                'top_risk_factor_3': prediction_result['top_risk_factors'][2] if len(prediction_result.get('top_risk_factors', [])) > 2 else None,
                'model_version': prediction_result.get('model_version', '4class_v1'),
                'model_accuracy': prediction_result.get('model_accuracy'),
                'prediction_latency_ms': prediction_result.get('prediction_latency_ms')
            }
            response = self.supabase.table('ml_predictions').insert(prediction_data).execute()
            if response.data:
                prediction_id = response.data[0]['id']
                logger.info(f"✅ Stored ML prediction #{prediction_id}")
                self.update_realtime_prediction(vehicle_id, prediction_id, prediction_data)
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to store ML prediction: {e}")
            return False
    
    def update_realtime_prediction(self, vehicle_id: int, prediction_id: int, prediction_data: Dict) -> bool:
        try:
            realtime_data = {
                'vehicle_id': vehicle_id,
                'latest_prediction_id': prediction_id,
                'predicted_status': prediction_data['predicted_status'],
                'confidence_score': prediction_data['confidence_score'],
                'prob_normal': prediction_data['prob_normal'],
                'prob_advisory': prediction_data['prob_advisory'],
                'prob_warning': prediction_data.get('prob_warning', 0.0),
                'prob_critical': prediction_data['prob_critical'],
                'predicted_failure_risk': prediction_data.get('predicted_failure_risk'),
                'days_until_maintenance': prediction_data.get('days_until_maintenance'),
                'recommended_actions': prediction_data.get('recommended_actions', []),
                'top_risk_factor_1': prediction_data.get('top_risk_factor_1'),
                'top_risk_factor_2': prediction_data.get('top_risk_factor_2'),
                'top_risk_factor_3': prediction_data.get('top_risk_factor_3'),
                'model_version': prediction_data.get('model_version'),
                'timestamp': prediction_data['timestamp'],
                'updated_at': datetime.now(timezone.utc).isoformat()
            }
            response = self.supabase.table('ml_predictions_realtime').upsert(realtime_data, on_conflict='vehicle_id').execute()
            return bool(response.data)
        except Exception as e:
            logger.error(f"Failed to update realtime prediction: {e}")
            return False
    
    def get_latest_prediction(self, vehicle_id: int) -> Optional[Dict]:
        try:
            response = self.supabase.table('ml_predictions_realtime').select('*').eq('vehicle_id', vehicle_id).execute()
            return response.data[0] if response.data and len(response.data) > 0 else None
        except Exception as e:
            logger.error(f"Failed to get latest prediction: {e}")
            return None

def extend_supabase_storage_with_ml(supabase_storage_instance):
    ml_storage = MLPredictionStorage(supabase_storage_instance.supabase_client)
    supabase_storage_instance.ml_storage = ml_storage
    logger.info("✅ Extended Supabase storage with ML prediction capabilities")
    return ml_storage
