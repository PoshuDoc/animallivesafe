import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import reviewsRouter from "./reviews";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(doctorsRouter);
router.use(appointmentsRouter);
router.use(reviewsRouter);
router.use(statsRouter);
router.use(adminRouter);

export default router;
