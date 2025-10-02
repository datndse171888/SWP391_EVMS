import { Request, Response } from 'express';
import { ServicePackage } from '../models/ServicePackage.js';
import { Service } from '../models/Service.js';

export async function createServicePackage(req: Request, res: Response) {
  try {
    // Expecting serviceItems: [{ serviceID, duration }]
    const { name, description, price, duration, status, discount, serviceItems, createAt, updateAt } = req.body as any;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Thiếu name hoặc price' });
    }
    let services: any[] | undefined = undefined;
    let finalDuration: number | undefined = duration;
    if (Array.isArray(serviceItems) && serviceItems.length > 0) {
      if (serviceItems.length < 2) {
        return res.status(400).json({ message: 'Gói dịch vụ phải chứa ít nhất 2 dịch vụ' });
      }
      const ids = serviceItems.map((s: any) => s.serviceID);
      const serviceDocs = await Service.find({ _id: { $in: ids } }).lean();
      const idToDoc = new Map(serviceDocs.map((d: any) => [String(d._id), d]));
      services = serviceItems
        .map((item: any) => {
          const doc = idToDoc.get(String(item.serviceID));
          if (!doc) return null;
          return {
            serviceID: String(doc._id),
            name: doc.name,
            price: doc.price,
            duration: item.duration,
          };
        })
        .filter(Boolean) as any[];
      if (services.length === 0) {
        return res.status(400).json({ message: 'Danh sách serviceItems không hợp lệ' });
      }
      finalDuration = services.reduce((sum: number, s: any) => sum + (Number(s.duration) || 0), 0);
      if (!finalDuration || finalDuration <= 0) {
        return res.status(400).json({ message: 'Tổng duration phải > 0' });
      }
    }
    if (finalDuration === undefined) {
      return res.status(400).json({ message: 'Thiếu duration hoặc serviceItems' });
    }
    // Duplicate content check: if another package has same non-name attributes and identical services
    if (services && services.length > 0) {
      const baseQuery: any = {
        price,
        discount: discount ?? 0,
        duration: finalDuration,
        status,
      };
      const candidates = await ServicePackage.find(
        services ? { ...baseQuery, services: { $size: services.length } } : baseQuery
      ).lean();
      const normalize = (arr: any[]) =>
        [...arr]
          .map((s: any) => ({ serviceID: String(s.serviceID), duration: Number(s.duration) }))
          .sort((a, b) => (a.serviceID > b.serviceID ? 1 : a.serviceID < b.serviceID ? -1 : a.duration - b.duration));
      const wanted = normalize(services);
      let conflicted: any | null = null;
      const hasSameContent = candidates.some((pkg: any) => {
        if ((pkg.description || '') !== (description || '')) return false;
        if (!Array.isArray(pkg.services) || pkg.services.length !== wanted.length) return false;
        const current = normalize(pkg.services);
        const same = current.every((it: any, idx: number) => it.serviceID === wanted[idx].serviceID && it.duration === wanted[idx].duration);
        if (same) conflicted = pkg;
        return same;
      });
      if (hasSameContent) {
        return res.status(400).json({
          message: 'Không thể tạo vì nội dung gói trùng với gói khác (cùng services và thông số).',
          reason: 'duplicate_content',
          conflictWith: conflicted ? { id: String(conflicted._id), name: conflicted.name } : undefined,
        });
      }
    }
    const created = await ServicePackage.create({ name, description, price, duration: finalDuration, status, discount, services, createAt, updateAt });
    return res.status(201).json({ message: 'Tạo gói dịch vụ thành công', servicePackage: created });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({
        message: 'Không thể tạo vì tên gói đã tồn tại.',
        reason: 'duplicate_name',
        keyPattern: error?.keyPattern,
        keyValue: error?.keyValue,
      });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getServicePackages(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '10'), 10), 1), 100);
    const q = (req.query.q as string) || '';
    const status = (req.query.status as string) || undefined;

    const filter: any = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      ServicePackage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ServicePackage.countDocuments(filter),
    ]);
    return res.json({ items, page, limit, total });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getServicePackageById(req: Request, res: Response) {
  try {
    const item = await ServicePackage.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    return res.json({ servicePackage: item });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function updateServicePackage(req: Request, res: Response) {
  try {
    const { name, description, price, duration, status, discount, services, serviceItems, createAt, updateAt } = req.body as any;

    // Tải bản ghi hiện tại để có giá trị mặc định nếu request không gửi
    const existing: any = await ServicePackage.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });

    let resolvedServices = services ?? existing.services;
    let finalDuration: number | undefined = duration ?? existing.duration;

    // Nếu client gửi serviceItems thì resolve giống create
    if (Array.isArray(serviceItems) && serviceItems.length > 0) {
      if (serviceItems.length < 2) {
        return res.status(400).json({ message: 'Gói dịch vụ phải chứa ít nhất 2 dịch vụ' });
      }
      const ids = serviceItems.map((s: any) => s.serviceID);
      const serviceDocs = await Service.find({ _id: { $in: ids } }).lean();
      const idToDoc = new Map(serviceDocs.map((d: any) => [String(d._id), d]));
      resolvedServices = serviceItems
        .map((item: any) => {
          const doc = idToDoc.get(String(item.serviceID));
          if (!doc) return null;
          return {
            serviceID: String(doc._id),
            name: doc.name,
            price: doc.price,
            duration: item.duration,
          };
        })
        .filter(Boolean) as any[];
      if (!resolvedServices || resolvedServices.length === 0) {
        return res.status(400).json({ message: 'Danh sách serviceItems không hợp lệ' });
      }
      finalDuration = (resolvedServices as any[]).reduce((sum: number, s: any) => sum + (Number(s.duration) || 0), 0);
      if (!finalDuration || finalDuration <= 0) {
        return res.status(400).json({ message: 'Tổng duration phải > 0' });
      }
    }

    // Kiểm tra trùng nội dung (bỏ qua bản ghi hiện tại)
    if (resolvedServices && resolvedServices.length > 0) {
      const baseQuery: any = {
        _id: { $ne: existing._id },
        price: price ?? existing.price,
        discount: discount ?? existing.discount ?? 0,
        duration: finalDuration,
        status: status ?? existing.status,
      };
      const candidates: any[] = await ServicePackage.find({ ...baseQuery, services: { $size: resolvedServices.length } }).lean();
      const normalize = (arr: any[]) =>
        [...arr]
          .map((s: any) => ({ serviceID: String(s.serviceID), duration: Number(s.duration) }))
          .sort((a, b) => (a.serviceID > b.serviceID ? 1 : a.serviceID < b.serviceID ? -1 : a.duration - b.duration));
      const wanted = normalize(resolvedServices);
      const hasSameContent = (candidates as any[]).some((pkg: any) => {
        if ((pkg.description || '') !== ((description ?? existing.description) || '')) return false;
        if (!Array.isArray(pkg.services) || pkg.services.length !== wanted.length) return false;
        const current = normalize(pkg.services);
        return current.every((it: any, idx: number) => it.serviceID === wanted[idx].serviceID && it.duration === wanted[idx].duration);
      });
      if (hasSameContent) {
        return res.status(400).json({
          message: 'Không thể cập nhật vì nội dung gói trùng với gói khác (cùng services và thông số).',
          reason: 'duplicate_content',
        });
      }
    }

    const updated = await ServicePackage.findByIdAndUpdate(
      req.params.id,
      {
        name: name ?? existing.name,
        description: description ?? existing.description,
        price: price ?? existing.price,
        duration: finalDuration,
        status: status ?? existing.status,
        discount: discount ?? existing.discount,
        services: resolvedServices,
        createAt: createAt ?? existing.createAt,
        updateAt: updateAt ?? existing.updateAt,
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    return res.json({ message: 'Cập nhật thành công', servicePackage: updated });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({
        message: 'Không thể cập nhật vì tên gói đã tồn tại.',
        reason: 'duplicate_name',
        keyPattern: error?.keyPattern,
        keyValue: error?.keyValue,
      });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function deleteServicePackage(req: Request, res: Response) {
  try {
    const deleted = await ServicePackage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ' });
    return res.json({ message: 'Xóa gói dịch vụ thành công' });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


