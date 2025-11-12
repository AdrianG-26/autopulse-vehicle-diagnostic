#!/usr/bin/env python3
"""
ML Health Utilities - Helper functions for ML prediction conversions
"""

def prediction_to_health_score(predicted_status_int):
    """
    Convert ML prediction (0-3) to health score (0-100)
    
    Args:
        predicted_status_int: Integer prediction (0=NORMAL, 1=ADVISORY, 2=WARNING, 3=CRITICAL)
    
    Returns:
        float: Health score between 0-100
    """
    health_score_map = {
        0: 95.0,  # NORMAL - Excellent health
        1: 70.0,  # ADVISORY - Good but needs monitoring
        2: 45.0,  # WARNING - Degraded, requires attention
        3: 20.0   # CRITICAL - Immediate action needed
    }
    return health_score_map.get(predicted_status_int, 50.0)  # Default to 50 if unknown


def prediction_to_status_text(predicted_status_int):
    """
    Convert ML prediction integer to status text
    
    Args:
        predicted_status_int: Integer prediction (0-3)
    
    Returns:
        str: Status text (NORMAL, ADVISORY, WARNING, CRITICAL)
    """
    status_map = {
        0: 'NORMAL',
        1: 'ADVISORY',
        2: 'WARNING',
        3: 'CRITICAL'
    }
    return status_map.get(predicted_status_int, 'UNKNOWN')


def extract_ml_fields_from_prediction(prediction_result):
    """
    Extract ML fields from prediction result for database storage
    
    Args:
        prediction_result: Dict from MLHealthPredictor.predict()
    
    Returns:
        dict: ML fields ready for database insertion
    """
    if not prediction_result:
        return {
            'ml_health_score': None,
            'ml_status': None,
            'ml_alerts': None,
            'ml_confidence': None
        }
    
    # Get predicted status integer (0-3)
    predicted_health_status = prediction_result.get('predicted_health_status', 0)
    
    # Convert to health score (0-100)
    ml_health_score = prediction_to_health_score(predicted_health_status)
    
    # Get status text
    ml_status = prediction_result.get('predicted_status', 'UNKNOWN')
    
    # Get alerts (recommended actions)
    ml_alerts = prediction_result.get('recommended_actions', [])
    
    # Get confidence score (convert from percentage to 0-1 if needed)
    confidence = prediction_result.get('confidence_score', 0)
    ml_confidence = confidence / 100.0 if confidence > 1 else confidence
    
    return {
        'ml_health_score': float(ml_health_score),
        'ml_status': ml_status,
        'ml_alerts': ml_alerts,
        'ml_confidence': float(ml_confidence)
    }


def merge_ml_prediction_into_reading(reading_dict, prediction_result):
    """
    Merge ML prediction fields into a sensor reading dictionary
    
    Args:
        reading_dict: Sensor reading dictionary
        prediction_result: ML prediction result from MLHealthPredictor
    
    Returns:
        dict: Updated reading with ML fields included
    """
    ml_fields = extract_ml_fields_from_prediction(prediction_result)
    reading_dict.update(ml_fields)
    return reading_dict
