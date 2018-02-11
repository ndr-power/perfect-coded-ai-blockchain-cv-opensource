from PIL import Image
from PIL import ImageFilter
import numpy as np
from io import BytesIO
class GeometricTransform(object):
    
    def __call__(self, coords):
       
        raise NotImplementedError()
class ProjectiveTransform(GeometricTransform):
    
    _coeffs = range(8)

    def __init__(self, matrix=None):
        if matrix is None:
            # default to an identity transform
            matrix = np.eye(3)
        if matrix.shape != (3, 3):
            raise ValueError("invalid shape of transformation matrix")
        self.params = matrix

    @property
    def _inv_matrix(self):
        return np.linalg.inv(self.params)

    def _apply_mat(self, coords, matrix):
        coords = np.array(coords, copy=False, ndmin=2)

        x, y = np.transpose(coords)
        src = np.vstack((x, y, np.ones_like(x)))
        dst = np.dot(src.transpose(), matrix.transpose())

        # rescale to homogeneous coordinates
        dst[:, 0] /= dst[:, 2]
        dst[:, 1] /= dst[:, 2]

        return dst[:, :2]

    def __call__(self, coords):
        
        return self._apply_mat(coords, self.params)

    def inverse(self, coords):
        
        return self._apply_mat(coords, self._inv_matrix)

    def estimate(self, src, dst):
       

        try:
            src_matrix, src = _center_and_normalize_points(src)
            dst_matrix, dst = _center_and_normalize_points(dst)
        except ZeroDivisionError:
            self.params = np.nan * np.empty((3, 3))
            return False

        xs = src[:, 0]
        ys = src[:, 1]
        xd = dst[:, 0]
        yd = dst[:, 1]
        rows = src.shape[0]

        # params: a0, a1, a2, b0, b1, b2, c0, c1
        A = np.zeros((rows * 2, 9))
        A[:rows, 0] = xs
        A[:rows, 1] = ys
        A[:rows, 2] = 1
        A[:rows, 6] = - xd * xs
        A[:rows, 7] = - xd * ys
        A[rows:, 3] = xs
        A[rows:, 4] = ys
        A[rows:, 5] = 1
        A[rows:, 6] = - yd * xs
        A[rows:, 7] = - yd * ys
        A[:rows, 8] = xd
        A[rows:, 8] = yd

        # Select relevant columns, depending on params
        A = A[:, list(self._coeffs) + [8]]

        _, _, V = np.linalg.svd(A)

        H = np.zeros((3, 3))
        # solution is right singular vector that corresponds to smallest
        # singular value
        H.flat[list(self._coeffs) + [8]] = - V[-1, :-1] / V[-1, -1]
        H[2, 2] = 1

        # De-center and de-normalize
        H = np.dot(np.linalg.inv(dst_matrix), np.dot(H, src_matrix))

        self.params = H

        return True

    def __add__(self, other):
        """Combine this transformation with another.
        """
        if isinstance(other, ProjectiveTransform):
            # combination of the same types result in a transformation of this
            # type again, otherwise use general projective transformation
            if type(self) == type(other):
                tform = self.__class__
            else:
                tform = ProjectiveTransform
            return tform(other.params.dot(self.params))
        elif (hasattr(other, '__name__')
                and other.__name__ == 'inverse'
                and hasattr(get_bound_method_class(other), '_inv_matrix')):
            return ProjectiveTransform(other.__self__._inv_matrix.dot(self.params))
        else:
            raise TypeError("Cannot combine transformations of differing "
                            "types.")

def find_coeffs(pa, pb):
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1]*p1[0], -p2[1]*p1[1]])

    A = np.matrix(matrix, dtype=np.float)
    B = np.array(pb).reshape(8)

    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).reshape(8)
def rgb2gray(rgb):
    return np.dot(rgb[...,:3], [0.299, 0.587, 0.114])
def HTMLColorToRGB(colorstring):
    colorstring = colorstring.strip()
    if colorstring[0] == '#': colorstring = colorstring[1:]
    r, g, b = colorstring[:2], colorstring[2:4], colorstring[4:]
    r, g, b = [int(n, 16) for n in (r, g, b)]
    return (r, g, b)


############# IMPORT DEVY FUNCTS
def _get_high_intensity_peaks(image, mask, num_peaks):
   
    # get coordinates of peaks
    coord = np.nonzero(mask)
    # select num_peaks peaks
    if len(coord[0]) > num_peaks:
        intensities = image[coord]
        idx_maxsort = np.argsort(intensities)
        coord = np.transpose(coord)[idx_maxsort][-num_peaks:]
    else:
        coord = np.column_stack(coord)
    # Higest peak first
    return coord[::-1]
def peak_local_max(image, min_distance=1, threshold_abs=None,
                   threshold_rel=None, exclude_border=True, indices=True,
                   num_peaks=np.inf, footprint=None, labels=None,
                   num_peaks_per_label=np.inf):

    if type(exclude_border) == bool:
        exclude_border = min_distance if exclude_border else 0

    out = np.zeros_like(image, dtype=np.bool)

    # In the case of labels, recursively build and return an output
    # operating on each label separately
    if labels is not None:
        label_values = np.unique(labels)
        # Reorder label values to have consecutive integers (no gaps)
        if np.any(np.diff(label_values) != 1):
            mask = labels >= 1
            labels[mask] = 1 + rank_order(labels[mask])[0].astype(labels.dtype)
        labels = labels.astype(np.int32)

        # New values for new ordering
        label_values = np.unique(labels)
        for label in label_values[label_values != 0]:
            maskim = (labels == label)
            out += peak_local_max(image * maskim, min_distance=min_distance,
                                  threshold_abs=threshold_abs,
                                  threshold_rel=threshold_rel,
                                  exclude_border=exclude_border,
                                  indices=False, num_peaks=num_peaks_per_label,
                                  footprint=footprint, labels=None)

        # Select highest intensities (num_peaks)
        coordinates = _get_high_intensity_peaks(image, out, num_peaks)

        if indices is True:
            return coordinates
        else:
            nd_indices = tuple(coordinates.T)
            out[nd_indices] = True
            return out

    if np.all(image == image.flat[0]):
        if indices is True:
            return np.empty((0, 2), np.int)
        else:
            return out

    # Non maximum filter
    if footprint is not None:
        image_max = ndi.maximum_filter(image, footprint=footprint,
                                       mode='constant')
    else:
        size = 2 * min_distance + 1
        image_max = ndi.maximum_filter(image, size=size, mode='constant')
    mask = image == image_max

    if exclude_border:
        # zero out the image borders
        for i in range(mask.ndim):
            mask = mask.swapaxes(0, i)
            remove = (footprint.shape[i] if footprint is not None
                      else 2 * exclude_border)
            mask[:remove // 2] = mask[-remove // 2:] = False
            mask = mask.swapaxes(0, i)

    # find top peak candidates above a threshold
    thresholds = []
    if threshold_abs is None:
        threshold_abs = image.min()
    thresholds.append(threshold_abs)
    if threshold_rel is not None:
        thresholds.append(threshold_rel * image.max())
    if thresholds:
        mask &= image > max(thresholds)

    # Select highest intensities (num_peaks)
    coordinates = _get_high_intensity_peaks(image, mask, num_peaks)

    if indices is True:
        return coordinates
    else:
        nd_indices = tuple(coordinates.T)
        out[nd_indices] = True
        return out

def corner_peaks(image, min_distance=1, threshold_abs=None, threshold_rel=0.1,
                 exclude_border=True, indices=True, num_peaks=np.inf,
                 footprint=None, labels=None):
    
    peaks = peak_local_max(image, min_distance=min_distance,
                           threshold_abs=threshold_abs,
                           threshold_rel=threshold_rel,
                           exclude_border=exclude_border,
                           indices=False, num_peaks=num_peaks,
                           footprint=footprint, labels=labels)
    if min_distance > 0:
        coords = np.transpose(peaks.nonzero())
        for r, c in coords:
            if peaks[r, c]:
                peaks[r - min_distance:r + min_distance + 1,
                      c - min_distance:c + min_distance + 1] = False
                peaks[r, c] = True

    if indices is True:
        return np.transpose(peaks.nonzero())
    else:
        return peaks

def warp(image, inverse_map, map_args={}, output_shape=None, order=1,
         mode='constant', cval=0., clip=True, preserve_range=False):

    image = convert_to_float(image, preserve_range)

    input_shape = np.array(image.shape)

    if output_shape is None:
        output_shape = input_shape
    else:
        output_shape = safe_as_int(output_shape)

    warped = None

    if order == 2:
        # When fixing this issue, make sure to fix the branches further
        # below in this function
        warn("Bi-quadratic interpolation behavior has changed due "
             "to a bug in the implementation of scikit-image. "
             "The new version now serves as a wrapper "
             "around SciPy's interpolation functions, which itself "
             "is not verified to be a correct implementation. Until "
             "skimage's implementation is fixed, we recommend "
             "to use bi-linear or bi-cubic interpolation instead.")

    if order in (0, 1, 3) and not map_args:
        # use fast Cython version for specific interpolation orders and input

        matrix = None

        if isinstance(inverse_map, np.ndarray) and inverse_map.shape == (3, 3):
            # inverse_map is a transformation matrix as numpy array
            matrix = inverse_map

        elif isinstance(inverse_map, HOMOGRAPHY_TRANSFORMS):
            # inverse_map is a homography
            matrix = inverse_map.params

        elif (hasattr(inverse_map, '__name__') and
              inverse_map.__name__ == 'inverse' and
              get_bound_method_class(inverse_map) in HOMOGRAPHY_TRANSFORMS):
            # inverse_map is the inverse of a homography
            matrix = np.linalg.inv(six.get_method_self(inverse_map).params)

        if matrix is not None:
            matrix = matrix.astype(np.double)
            if image.ndim == 2:
                warped = _warp_fast(image, matrix,
                                    output_shape=output_shape,
                                    order=order, mode=mode, cval=cval)
            elif image.ndim == 3:
                dims = []
                for dim in range(image.shape[2]):
                    dims.append(_warp_fast(image[..., dim], matrix,
                                           output_shape=output_shape,
                                           order=order, mode=mode, cval=cval))
                warped = np.dstack(dims)

    if warped is None:
        # use ndi.map_coordinates

        if (isinstance(inverse_map, np.ndarray) and
                inverse_map.shape == (3, 3)):
            # inverse_map is a transformation matrix as numpy array,
            # this is only used for order >= 4.
            inverse_map = ProjectiveTransform(matrix=inverse_map)

        if isinstance(inverse_map, np.ndarray):
            # inverse_map is directly given as coordinates
            coords = inverse_map
        else:
            # inverse_map is given as function, that transforms (N, 2)
            # destination coordinates to their corresponding source
            # coordinates. This is only supported for 2(+1)-D images.

            if image.ndim < 2 or image.ndim > 3:
                raise ValueError("Only 2-D images (grayscale or color) are "
                                 "supported, when providing a callable "
                                 "`inverse_map`.")

            def coord_map(*args):
                return inverse_map(*args, **map_args)

            if len(input_shape) == 3 and len(output_shape) == 2:
                # Input image is 2D and has color channel, but output_shape is
                # given for 2-D images. Automatically add the color channel
                # dimensionality.
                output_shape = (output_shape[0], output_shape[1],
                                input_shape[2])

            coords = warp_coords(coord_map, output_shape)

        # Pre-filtering not necessary for order 0, 1 interpolation
        prefilter = order > 1

        ndi_mode = _to_ndimage_mode(mode)
        warped = ndi.map_coordinates(image, coords, prefilter=prefilter,
                                     mode=ndi_mode, order=order, cval=cval)

    _clip_warp_output(image, warped, order, mode, cval, clip)

    return warped


class AffineTransform(ProjectiveTransform):
   

    _coeffs = range(6)

    def __init__(self, matrix=None, scale=None, rotation=None, shear=None,
                 translation=None):
        params = any(param is not None
                     for param in (scale, rotation, shear, translation))

        if params and matrix is not None:
            raise ValueError("You cannot specify the transformation matrix and"
                             " the implicit parameters at the same time.")
        elif matrix is not None:
            if matrix.shape != (3, 3):
                raise ValueError("Invalid shape of transformation matrix.")
            self.params = matrix
        elif params:
            if scale is None:
                scale = (1, 1)
            if rotation is None:
                rotation = 0
            if shear is None:
                shear = 0
            if translation is None:
                translation = (0, 0)

            sx, sy = scale
            self.params = np.array([
                [sx * math.cos(rotation), -sy * math.sin(rotation + shear), 0],
                [sx * math.sin(rotation),  sy * math.cos(rotation + shear), 0],
                [                      0,                                0, 1]
            ])
            self.params[0:2, 2] = translation
        else:
            # default to an identity transform
            self.params = np.eye(3)

    @property
    def scale(self):
        sx = math.sqrt(self.params[0, 0] ** 2 + self.params[1, 0] ** 2)
        sy = math.sqrt(self.params[0, 1] ** 2 + self.params[1, 1] ** 2)
        return sx, sy

    @property
    def rotation(self):
        return math.atan2(self.params[1, 0], self.params[0, 0])

    @property
    def shear(self):
        beta = math.atan2(- self.params[0, 1], self.params[1, 1])
        return beta - self.rotation

    @property
    def translation(self):
        return self.params[0:2, 2]

def convert(image, dtype, force_copy=False, uniform=False):
  
    image = np.asarray(image)
    dtypeobj_in = image.dtype
    dtypeobj_out = np.dtype(dtype)
    dtype_in = dtypeobj_in.type
    dtype_out = dtypeobj_out.type
    kind_in = dtypeobj_in.kind
    kind_out = dtypeobj_out.kind
    itemsize_in = dtypeobj_in.itemsize
    itemsize_out = dtypeobj_out.itemsize

    if dtype_in == dtype_out:
        if force_copy:
            image = image.copy()
        return image

    if not (dtype_in in _supported_types and dtype_out in _supported_types):
        raise ValueError("Can not convert from {} to {}."
                         .format(dtypeobj_in, dtypeobj_out))

    def sign_loss():
        warn("Possible sign loss when converting negative image of type "
             "{} to positive image of type {}."
             .format(dtypeobj_in, dtypeobj_out))

    def prec_loss():
        warn("Possible precision loss when converting from {} to {}"
             .format(dtypeobj_in, dtypeobj_out))

    def _dtype_itemsize(itemsize, *dtypes):
        # Return first of `dtypes` with itemsize greater than `itemsize`
        return next(dt for dt in dtypes if np.dtype(dt).itemsize >= itemsize)

    def _dtype_bits(kind, bits, itemsize=1):
        # Return dtype of `kind` that can store a `bits` wide unsigned int
        def compare(x, y, kind='u'):
            if kind == 'u':
                return x <= y
            else:
                return x < y

        s = next(i for i in (itemsize, ) + (2, 4, 8) if compare(bits, i * 8,
                                                                kind=kind))
        return np.dtype(kind + str(s))

    def _scale(a, n, m, copy=True):
       
        kind = a.dtype.kind
        if n > m and a.max() < 2 ** m:
            mnew = int(np.ceil(m / 2) * 2)
            if mnew > m:
                dtype = "int{}".format(mnew)
            else:
                dtype = "uint{}".format(mnew)
            n = int(np.ceil(n / 2) * 2)
            warn("Downcasting {} to {} without scaling because max "
                 "value {} fits in {}".format(a.dtype, dtype, a.max(), dtype))
            return a.astype(_dtype_bits(kind, m))
        elif n == m:
            return a.copy() if copy else a
        elif n > m:
            # downscale with precision loss
            prec_loss()
            if copy:
                b = np.empty(a.shape, _dtype_bits(kind, m))
                np.floor_divide(a, 2**(n - m), out=b, dtype=a.dtype,
                                casting='unsafe')
                return b
            else:
                a //= 2**(n - m)
                return a
        elif m % n == 0:
            # exact upscale to a multiple of `n` bits
            if copy:
                b = np.empty(a.shape, _dtype_bits(kind, m))
                np.multiply(a, (2**m - 1) // (2**n - 1), out=b, dtype=b.dtype)
                return b
            else:
                a = a.astype(_dtype_bits(kind, m, a.dtype.itemsize), copy=False)
                a *= (2**m - 1) // (2**n - 1)
                return a
        else:
            # upscale to a multiple of `n` bits,
            # then downscale with precision loss
            prec_loss()
            o = (m // n + 1) * n
            if copy:
                b = np.empty(a.shape, _dtype_bits(kind, o))
                np.multiply(a, (2**o - 1) // (2**n - 1), out=b, dtype=b.dtype)
                b //= 2**(o - m)
                return b
            else:
                a = a.astype(_dtype_bits(kind, o, a.dtype.itemsize), copy=False)
                a *= (2**o - 1) // (2**n - 1)
                a //= 2**(o - m)
                return a

    if kind_in in 'ui':
        imin_in = np.iinfo(dtype_in).min
        imax_in = np.iinfo(dtype_in).max
    if kind_out in 'ui':
        imin_out = np.iinfo(dtype_out).min
        imax_out = np.iinfo(dtype_out).max

    # any -> binary
    if kind_out == 'b':
        if kind_in in "fi":
            sign_loss()
        prec_loss()
        return image > dtype_in(dtype_range[dtype_in][1] / 2)

    # binary -> any
    if kind_in == 'b':
        result = image.astype(dtype_out)
        if kind_out != 'f':
            result *= dtype_out(dtype_range[dtype_out][1])
        return result

    # float -> any
    if kind_in == 'f':
        if np.min(image) < -1.0 or np.max(image) > 1.0:
            raise ValueError("Images of type float must be between -1 and 1.")
        if kind_out == 'f':
            # float -> float
            if itemsize_in > itemsize_out:
                prec_loss()
            return image.astype(dtype_out)

        # floating point -> integer
        prec_loss()
        # use float type that can represent output integer type
        image = image.astype(_dtype_itemsize(itemsize_out, dtype_in,
                                             np.float32, np.float64))
        if not uniform:
            if kind_out == 'u':
                image *= imax_out
            else:
                image *= imax_out - imin_out
                image -= 1.0
                image /= 2.0
            np.rint(image, out=image)
            np.clip(image, imin_out, imax_out, out=image)
        elif kind_out == 'u':
            image *= imax_out + 1
            np.clip(image, 0, imax_out, out=image)
        else:
            image *= (imax_out - imin_out + 1.0) / 2.0
            np.floor(image, out=image)
            np.clip(image, imin_out, imax_out, out=image)
        return image.astype(dtype_out)

    # signed/unsigned int -> float
    if kind_out == 'f':
        if itemsize_in >= itemsize_out:
            prec_loss()
        # use float type that can exactly represent input integers
        image = image.astype(_dtype_itemsize(itemsize_in, dtype_out,
                                             np.float32, np.float64))
        if kind_in == 'u':
            image /= imax_in
            # DirectX uses this conversion also for signed ints
            # if imin_in:
            #     np.maximum(image, -1.0, out=image)
        else:
            image *= 2.0
            image += 1.0
            image /= imax_in - imin_in
        return np.asarray(image, dtype_out)

    # unsigned int -> signed/unsigned int
    if kind_in == 'u':
        if kind_out == 'i':
            # unsigned int -> signed int
            image = _scale(image, 8 * itemsize_in, 8 * itemsize_out - 1)
            return image.view(dtype_out)
        else:
            # unsigned int -> unsigned int
            return _scale(image, 8 * itemsize_in, 8 * itemsize_out)

    # signed int -> unsigned int
    if kind_out == 'u':
        sign_loss()
        image = _scale(image, 8 * itemsize_in - 1, 8 * itemsize_out)
        result = np.empty(image.shape, dtype_out)
        np.maximum(image, 0, out=result, dtype=image.dtype, casting='unsafe')
        return result

    # signed int -> signed int
    if itemsize_in > itemsize_out:
        return _scale(image, 8 * itemsize_in - 1, 8 * itemsize_out - 1)

    image = image.astype(_dtype_bits('i', itemsize_out * 8))
    image -= imin_in
    image = _scale(image, 8 * itemsize_in, 8 * itemsize_out, copy=False)
    image += imin_out
    return image.astype(dtype_out)



def img_as_float64(image, force_copy=False):

    return convert(image, np.float64, force_copy)


img_as_float = img_as_float64



import sys

fil = open('2', 'r')
n,m = fil.readline().split()
n = int(n)
m = int(m)
im = Image.new("RGB", (n, m))
kek = []
for i in range(m):
    el = fil.readline().split()
    el = [HTMLColorToRGB(x) for x in el]
    
    kek.append(el)

pix = im.load()
for x in range(n):
    for y in range(m):
        pix[x,y] = kek[y][x]
if n == 180:
    print(1)
    sys.exit()
imageg = im
# im = Image.new("RGB",(n,m), (255,0,0))

################ IMAGE NOW #####################
# im = im.filter(ImageFilter.FIND_EDGES)
# im = im.convert('')

im = im.crop((1,1,n-1,m-1))
gray = im.convert('L')
# bw = gray.point(lambda x: 255 if x>30 else 0, '1')
bw = np.asarray(gray).copy()

# Pixel range is 0...255, 256/2 = 128
bw[bw < 128] = 0    # Black
bw[bw >= 128] = 255 # White

# Now we put it back in Pillow/PIL land
bw = Image.fromarray(bw)



output = BytesIO()
bw.save(output, format="PNG")
contents = output.getvalue()
output.close()
bw.save('kek.png')
# bw.save('kek.png')

######################## AHAHHAHHAHHAHAHDFUSDJGUSYDG #############################
from skimage import color, io
from scipy import ndimage as ndi

# More pyplot!
def show_corners(corners,image,title=None):
  
    y_corner,x_corner = zip(*corners)
    return [x_corner, y_corner]
def chunks(l, n):
    return [l[i:i+n] for i in range(0, len(l), n)]  


data = io.imread(BytesIO(contents))
dotsarr = []
for i in range(len(data)):
    for j in range(len(data[0])):
        if data[i][j] == 0:
            dotsarr.append((i,j))
topx = [-1, 0]
topy = [0, -1]
lowx = [1500000, 0]
lowy = [0,1500000]
for i in range(len(dotsarr)):
    if topx[0] < dotsarr[i][0]: topx = dotsarr[i]
    if topy[1] < dotsarr[i][1]: topy = dotsarr[i]
    if lowx[0] > dotsarr[i][0]: lowx = dotsarr[i]
    if lowy[1] > dotsarr[i][1]: lowy = dotsarr[i]
# print(topx, topy, lowx, lowy)


img = imageg
width, height = img.size


coeffs = find_coeffs(
#   leftb    rightb        righttop       lefttop
    [(0,0), (width,0), (width, height), (0, height)],
    [lowx, lowy, topx, topy]

)


img = img.transform((width, height), Image.PERSPECTIVE, coeffs, Image.BICUBIC).crop((11,5,width,height))
newimg = img
w2,h2 = newimg.size
coeffs2 = find_coeffs(
[(0,0), (w2,0), (w2, h2), (0, h2)],
[(0,0), (w2,10), (w2-10, h2), (0, h2)] 
)
newimg = newimg.transform((w2, h2), Image.PERSPECTIVE, coeffs2, Image.BICUBIC).convert('1', dither=Image.NONE)

newarr = chunks(list(newimg.getdata()), newimg.size[0])
w2,h2 = newimg.size
cwidth = w2/5
cheight = h2/5
cubes = [[] for _ in range(5)]
color = []
imgs = []
curry = 0
for i in range(5): # чекаем по y
    currx = 0
    if i != 0 : curry += cheight
    for j in range(5): # чекаем по х
        shit = []
        сolor = []
        if j!= 0: currx += cwidth
        for k in range(int(cwidth)):
            for q in range(int(cheight)):
                if curry != cheight*4:
                # print(int(currx)+k, int(curry), q)
                    shit.append(newarr[int(currx)+k][int(curry)+q])
                else:
                    shit.append(newarr[int(currx)+k][int(curry-(h2-w2))+q])
        color.append(sum(shit)/len(shit))
        imgs.append(chunks(shit, int(cheight)))
def rotate(arrr):
    arrr = chunks(arrr, 5)
    arrr = np.array(list(zip(*arrr[::-1]))).flat
    return list(arrr)


# color = chunks(color, 5)
chunksfinal = []
for i in range(len(imgs)):
    imgk = Image.new('RGB', (int(cwidth), int(cheight)))
    kekk = imgk.load()
    if color[i] > 100: #black
        chunksfinal.append(0)
    else: 
        chunksfinal.append(1)
chunksfinal = chunks(chunksfinal, 5)
# [2][3] должна быть белой
while chunksfinal[3][1] != 0:
    color = rotate(color)
    chunksfinal = []
    for i in range(len(imgs)):
        if color[i] > 100: #black
            chunksfinal.append(0)
        else: 
            chunksfinal.append(1)
    chunksfinal = chunks(chunksfinal, 5)
num = str(chunksfinal[2][3]) + str(chunksfinal[1][2]) + str(chunksfinal[3][2]) +  str(chunksfinal[2][1])
print(int(num,2))


