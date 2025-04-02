import express from 'express';
import { getForumMessages, getMenteeForumMessages, getMenteeGroups, getMenteesByMentorGroup, getMenteesInForumGroup, getMentorGroups, sendMenteeMessage, sendMessage } from '../../controller/Teacher/forumController.js';

const router = express.Router();

/**
 * 🔹 Fetch Groups Assigned to a Mentor
 */
router.get('/teacher/groups/:mentor_id', getMentorGroups)

/**
 * 🔹 Fetch Mentees under a Specific Mentor Group
 */
router.get('/teacher/mentees/:mmr_id', getMenteesByMentorGroup)

/**
 * 🔹 Fetch Messages from Forum for a Specific Mentor Group (Fix: Added mmr_id parameter)
 */
router.get('/teacher/getmessages/:mmr_id', getForumMessages);
    
/**
 * 🔹 Send a Message to the Forum
 */
router.post('/teacher/sendmessages', sendMessage)

/**
 * 🔹 Fetch Groups Assigned to a Mentee
 */
router.get('/mentee/groups/:sid', getMenteeGroups);

/**
 * 🔹 Fetch All Mentees in a Specific Forum Group
 */
router.get('/mentee/forum-mentees/:mmr_id', getMenteesInForumGroup);

/**
 * 🔹 Fetch Messages from Forum for a Specific Mentee Group
 */
router.get('/mentee/getmessages/:mmr_id', getMenteeForumMessages);

/**
 * 🔹 Mentee Sends a Message to the Forum
 */
router.post('/mentee/sendmessages', sendMenteeMessage);


   

export default router;
