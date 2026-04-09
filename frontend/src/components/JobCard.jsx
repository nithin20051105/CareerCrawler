import React, { useState } from 'react';
import styles from './JobCard.module.css';

export default function JobCard({ job }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className={styles.row}>
      <div
        className={styles.avatar}
        style={{ background: job.color.bg, color: job.color.text }}
      >
        {job.color.letter}
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{job.title}</div>
        <div className={styles.meta}>
          <span>{job.company}</span>
          <span>📍 {job.location}</span>
          <span>🎯 {job.experience}</span>
          <span>🆔 {job.sourceJobId}</span>
          <span>🕐 Scraped {job.scrapedAtLabel}</span>
          <span>📅 {job.scrapedAtFull}</span>
        </div>
      </div>

      <div className={styles.tags}>
        {job.skills.map((skill, i) => (
          <span
            key={skill}
            className={styles.tag}
            style={{
              background: job.tagColors[i]?.bg || 'rgba(124,58,237,0.15)',
              color: job.tagColors[i]?.text || '#A78BFA',
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.saveBtn} ${saved ? styles.saved : ''}`}
          onClick={() => setSaved(!saved)}
          title={saved ? 'Unsave' : 'Save job'}
        >
          {saved ? '♥' : '♡'}
        </button>
        <a
          href={job.jobLink}
          target="_blank"
          rel="noreferrer"
          className={styles.applyBtn}
        >
          Apply →
        </a>
      </div>
    </div>
  );
}
