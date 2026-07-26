from database import db
from datetime import datetime
import time

class User(db.Model):
    usn = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, unique=True, nullable=False)
    role = db.Column(db.String, default="STUDENT")
    password_hash = db.Column(db.String, nullable=False)

class Machine(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    status = db.Column(db.String, default="FREE")

class Booking(db.Model):
    __table_args__ = (
        db.Index('idx_booking_machine_date_slot', 'machineId', 'date', 'slot'),
        db.Index('idx_booking_user', 'userUsn'),
    )
    id = db.Column(db.String, primary_key=True)
    machineId = db.Column(db.String, db.ForeignKey('machine.id'), nullable=False)
    userUsn = db.Column(db.String, db.ForeignKey('user.usn'), nullable=False)
    date = db.Column(db.String, nullable=False)
    slot = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default="PENDING")
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)

class IssueReport(db.Model):
    __table_args__ = (
        db.Index('idx_issue_user', 'userUsn'),
    )
    id = db.Column(db.String, primary_key=True)
    machineId = db.Column(db.String, db.ForeignKey('machine.id'), nullable=False)
    userUsn = db.Column(db.String, db.ForeignKey('user.usn'), nullable=False)
    description = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    status = db.Column(db.String, default="OPEN")
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
